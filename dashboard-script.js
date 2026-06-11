// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAT1SCeif3rZf5p-29AGtmIzyEbAtf4B34",
  authDomain: "taptappro-123b4.firebaseapp.com",
  projectId: "taptappro-123b4",
  storageBucket: "taptappro-123b4.firebasestorage.app",
  messagingSenderId: "64834183820",
  appId: "1:64834183820:web:3ceced5b95168e3bc951a9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// 1. Pehle Firebase ka Config Code chalega (Jo tumne save kiya tha)
const firebaseConfig = {
  apiKey: "AIzaSyAT1SCeif3rZf5p-29AGtmIzyEbAtf4B34",
  authDomain: "taptappro-123b4.firebaseapp.com",
  projectId: "taptappro-123b4",
  storageBucket: "taptappro-123b4.firebasestorage.app",
  messagingSenderId: "64834183820",
  appId: "1:64834183820:web:3ceced5b95168e3bc951a9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();


// 2. Ab iske theek neeche tumhaara yeh Time Lock Guard chalega
function checkGameStatus() {
  const currentHour = new Date().getHours(); 
  
  if (currentHour < 6 || currentHour >= 23) {
    document.body.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#121212; color:white; font-family:sans-serif; text-align:center; padding:20px;">
        <h1 style="color:#ff4757; font-size:2.5rem;">💤 Game is Closed for Tonight! 💤</h1>
        <p style="font-size:1.2rem; margin:15px 0; color:#ccc;">Take rest, protect your health, and sleep well. Your wellness matters to us!</p>
        <p style="background:#2f3542; padding:10px 20px; border-radius:20px; font-weight:bold; color:#ffa502;">See you tomorrow morning at 6:00 AM! 🌅</p>
      </div>
    `;
    return false;
  }
  return true;
}

checkGameStatus();
// Global State Storage (No Hardcoded Names - User input se chalega!)
let userProfile = {
    name: "",
    winnings: 0,
    diamonds: 80, // Simulation ke liye shuruat mein 80 diamonds set kiye
    nameChangesLeft: 3,
    avatarChangesLeft: 3
};

// Gameplay Screen State Variables
let scores = { 1: 0, 2: 0, 3: 0, 4: 0 };
let timeLeft = 30;
let timerId = null;
let gameActive = false;
let micOn = false;

// Audio Element Settings
const tapSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
tapSound.volume = 0.5;

// Sateek Badlav: Registered Active Referral Players List Matrix Data ko ekdum khali [] kiya
let registeredReferrals = [];

const rewardsMatrix = [
    { members: "10 Members", cash: "₹80", status: "claimable" },
    { members: "20 Members", cash: "₹150", status: "claimable" },
    { members: "50 Members", cash: "₹350", status: "claimable" },
    { members: "100 Members", cash: "₹700", status: "claimable" },
    { members: "500 Members", cash: "₹3,500", status: "locked" },
    { members: "1000 Members", cash: "₹7,000", status: "locked" },
    { members: "2000 Members", cash: "₹1,20,000", status: "locked" },
    { members: "4000 Members", cash: "🏡 Dream House", status: "locked" },
    { members: "6000 Members", cash: "🏡 Dream House", status: "locked" },
    { members: "8000 Members", cash: "🏡 Dream House", status: "locked" },
    { members: "10000 Members", cash: "🏡 Dream House", status: "locked" },
    { members: "16000 Members", cash: "🏡 Dream House", status: "locked" },
    { members: "20000 Members", cash: "🏡 Dream House", status: "locked" },
    { members: "40000 Members", cash: "🏡 Dream House", status: "locked" }
];

let lobbyMicOn = false;
let friendsListCount = 0; // Sateek Badlav: Initial friends count ko 0 kiya kyonki list khali hai

// Auth Switching
function switchAuth(type) {
    if(type === 'login') {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    } else {
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('login-form').style.display = 'none';
    }
}

// Sateek Badlav: Double OTP Send Karne Ka Simulator Function
function sendOTP() {
    let phone = document.getElementById('reg-phone').value;
    let name = document.getElementById('reg-name').value;
    let email = document.getElementById('reg-email').value;
    
    if(!phone || !name || !email) { 
        alert("Please fill Name, Gmail, and Mobile Number fields!"); return; 
    }
    
    document.getElementById('otp-section').style.display = 'block';
    alert("🔒 Dual Verification Sent!\n\n1. Mobile OTP sent to: " + phone + "\n2. Gmail OTP sent to: " + email + "\n\nPlease enter both codes to proceed.");
}

// Sateek Badlav: Dono Alag-Alag OTP Verify Karne Ka Function
function verifyAndRegister() {
    let mobileOtp = document.getElementById('otp-mobile-input').value;
    let gmailOtp = document.getElementById('otp-gmail-input').value;
    
    if(!mobileOtp || !gmailOtp) {
        alert("❌ Please enter both Mobile OTP and Gmail OTP!"); return;
    }
    
    if(mobileOtp.length >= 4 && gmailOtp.length >= 4) {
        userProfile.name = document.getElementById('reg-name').value;
        alert("✅ Awesome! Both Mobile and Gmail OTP Verified Successfully!");
        loadDashboard();
    } else {
        alert("❌ Invalid OTP! Please enter a valid 4 digit code in both fields.");
    }
}

function loginUser() {
    let phone = document.getElementById('login-phone').value;
    let pass = document.getElementById('login-pass').value;
    if(!phone || !pass) { alert("Please enter mobile number and password!"); return; }
    userProfile.name = "Sayad Parveen"; // Bypass defaults
    loadDashboard();
}

// Dashboard Inits
function loadDashboard() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'grid';
    document.getElementById('gameplay-screen').style.display = 'none';
    
    document.getElementById('display-name').innerText = userProfile.name;
    document.getElementById('slot-1').innerText = userProfile.name + " (You)";
    updateBalancesUI();
    renderRewards();
    renderActiveReferrals();
}

function updateBalancesUI() {
    document.getElementById('winning-balance').innerText = "₹" + userProfile.winnings + ".00";
    document.getElementById('diamond-balance').innerText = userProfile.diamonds + " 💎";
}

// Toggle Inline Withdrawal Fields (UPI vs Bank Details)
function switchWithdrawFields() {
    let type = document.getElementById('withdraw-type').value;
    if(type === "UPI") {
        document.getElementById('upi-input-box').style.display = "block";
        document.getElementById('bank-input-box').style.display = "none";
    } else {
        document.getElementById('upi-input-box').style.display = "none";
        document.getElementById('bank-input-box').style.display = "block";
    }
}

// Process Real-time Withdrawal Validation Rules
function processWithdrawal() {
    let amt = parseInt(document.getElementById('withdraw-amount').value);
    let type = document.getElementById('withdraw-type').value;
    
    if(!amt || amt < 50 || amt > 400000) {
        alert("❌ Limit Warning: Withdrawal amount must be between ₹50 and ₹4,00,000"); return;
    }
    
    if(type === "UPI") {
        let upiId = document.getElementById('withdraw-upi-id').value;
        if(!upiId) { alert("❌ Please enter your UPI ID first!"); return; }
        alert(`💸 Withdrawal Request of ₹${amt} registered successfully on UPI ID: ${upiId}.\n🔋 Settled under max 2 daily payouts limit. Arrives within 2 days!`);
    } else {
        let holder = document.getElementById('withdraw-bank-name').value;
        let accNum = document.getElementById('withdraw-bank-acc').value;
        let ifsc = document.getElementById('withdraw-bank-ifsc').value;
        if(!holder || !accNum || !ifsc) { alert("❌ Please enter Account Holder Name, Account Number, and IFSC Code!"); return; }
        alert(`💸 Bank Account Transfer Request of ₹${amt} registered successfully!\n👤 Holder Name: ${holder}\n🏦 Account: ${accNum}\n🔒 IFSC Code: ${ifsc}\nProcessed automatically inside 2 days!`);
    }
}

// Render dynamic Active Registered Referrals underneath Rewards
function renderActiveReferrals() {
    const listContainer = document.getElementById('active-players-list-box');
    listContainer.innerHTML = "";
    
    if (registeredReferrals.length === 0) {
        listContainer.innerHTML = `<p style="font-size: 11px; color: #888; font-style: italic;">No active referrals yet. Share code to earn!</p>`;
        return;
    }
    
    registeredReferrals.forEach((player) => {
        listContainer.innerHTML += `
            <div class="active-user-item">
                <div class="active-user-top">
                    <span>👤 ${player.name}</span>
                </div>
                <span class="active-user-phone">📞 ${player.phone}</span>
                <div class="active-user-actions">
                    <button class="act-btn grp" onclick="inviteToLobby('${player.name}')">➕ Lobby Group</button>
                    <button class="act-btn frnd" onclick="sendCustomFriendRequest('${player.name}')">🤝 Add Friend</button>
                </div>
            </div>
        `;
    });
}

// Auto Matchmaking Engine Simulator (Unknown Players Loop)
function launchGame() {
    let currentHour = new Date().getHours();
    if(currentHour < 6 || currentHour >= 23) {
        alert("❌ Game Closed! TapTap Pro match timings are strictly from 6:00 AM to 11:00 PM only."); return;
    }
    
    if(userProfile.diamonds < 4) {
        alert("❌ Insufficient Balance! 4 Diamonds entry fee is mandatory to load the multiplayer stage."); return;
    }

    let statusBox = document.getElementById('matchmaking-status-text');
    let btn = document.getElementById('main-play-btn');
    
    btn.disabled = true;
    statusBox.style.color = "#00e5ff";
    statusBox.innerText = "🔍 Checking automated server & searching for online unknown players...";

    // Simulated 4 seconds online matchmaking trigger loop
    setTimeout(() => {
        let playersFound = Math.random() > 0.5;

        if(playersFound) {
            statusBox.style.color = "#00ff66";
            statusBox.innerText = "🎮 Real Unknown Players Found! Syncing voice lobbys & launching Battle Arena...";
            setTimeout(() => {
                userProfile.diamonds -= 4;
                updateBalancesUI();
                statusBox.innerText = "";
                btn.disabled = false;
                
                document.getElementById('dashboard-screen').style.display = 'none';
                document.getElementById('gameplay-screen').style.display = 'grid';
                document.getElementById('start-overlay').style.display = 'flex';
                
                document.getElementById('name-p1').innerText = userProfile.name.toUpperCase() || "YOU";
                document.getElementById('name-p2').innerText = "RANDOM_PLAYER_2";
                document.getElementById('name-p3').innerText = "RANDOM_PLAYER_3";
                document.getElementById('name-p4').innerText = "RANDOM_PLAYER_4";
            }, 1500);
        } else {
            statusBox.style.color = "#ff3b30";
            statusBox.innerText = "❌ Players not available! Refer your friends and play game and earn.";
            btn.disabled = false;
            alert("⚠️ Matchmaking Timeout! Unknown players are currently busy or unavailable. Invite your registered referrals into your group lobby rooms to lock a match immediately!");
        }
    }, 4000);
}

// ================= ASALI GAMEPLAY CORE LOGIC FUNCTIONS =================
function startGame() {
    document.getElementById('start-overlay').style.display = 'none'; 
    scores = { 1: 0, 2: 0, 3: 0, 4: 0 }; 
    timeLeft = 30;
    gameActive = true;
    
    document.getElementById('score-p1').innerText = '0';
    document.getElementById('score-p2').innerText = '0';
    document.getElementById('score-p3').innerText = '0';
    document.getElementById('score-p4').innerText = '0';
    document.getElementById('timer-display').innerText = '30s';

    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').innerText = timeLeft + 's';

        if(gameActive) {
            scores[2] += Math.floor(Math.random() * 2); document.getElementById('score-p2').innerText = scores[2];
            scores[3] += Math.floor(Math.random() * 2); document.getElementById('score-p3').innerText = scores[3];
            scores[4] += Math.floor(Math.random() * 2); document.getElementById('score-p4').innerText = scores[4];
        }

        if (timeLeft <= 0) {
            clearInterval(timerId);
            gameActive = false;
            showWinners(); 
        }
    }, 1000);
}

function playerTap(playerNum) {
    if (!gameActive) return; 

    tapSound.currentTime = 0;
    tapSound.play().catch(e => console.log("Audio play error"));

    scores[playerNum]++; 
    document.getElementById('score-p' + playerNum).innerText = scores[playerNum]; 
}

function sendFriendRequest(playerNum, event) {
    event.stopPropagation(); 
    let pName = document.getElementById('name-p' + playerNum).innerText;
    alert("💖 Friend Request Sent to " + pName + " successfully!");
}

function toggleMic() {
    micOn = !micOn;
    const micDot = document.getElementById('mic-status');
    if (micOn) {
        micDot.className = "mic-status-dot green-dot"; 
    } else {
        micDot.className = "mic-status-dot red-dot";   
    }
}

function showWinners() {
    let p1Name = document.getElementById('name-p1').innerText;
    let p2Name = document.getElementById('name-p2').innerText;
    let p3Name = document.getElementById('name-p3').innerText;
    let p4Name = document.getElementById('name-p4').innerText;

    let results = [
        { name: p1Name, score: scores[1], id: 1 },
        { name: p2Name, score: scores[2], id: 2 },
        { name: p3Name, score: scores[3], id: 3 },
        { name: p4Name, score: scores[4], id: 4 }
    ];

    results.sort((a, b) => b.score - a.score);

    if(results[0].id === 1) { userProfile.diamonds += 6; alert(`🏆 Congratulations! You won 1st Place with ${results[0].score} taps! Added 6 Diamonds.`); }
    else if(results[1].id === 1) { userProfile.diamonds += 4; alert(`🥈 Good Job! You won 2nd Place with ${results[1].score} taps! Added 4 Diamonds.`); }
    else if(results[2].id === 1) { userProfile.diamonds += 2; alert(`🥉 Nice Try! You won 3rd Place with ${results[2].score} taps! Added 2 Diamonds.`); }
    else { alert(`❌ Game Over! You placed 4th. Better luck next time!`); }

    alert(
        "⏱️ TIME UP! Match Results Overview:\n\n" +
        "🥇 1st Winner: " + results[0].name + " (" + results[0].score + " Taps)\n" +
        "🥈 2nd Winner: " + results[1].name + " (" + results[1].score + " Taps)\n" +
        "🥉 3rd Winner: " + results[2].name + " (" + results[2].score + " Taps)\n" +
        "❌ 4th Place: " + results[3].name + " (" + results[3].score + " Taps)"
    );

    loadDashboard();
}

// Razorpay Gateways Simulators 
function buyDiamonds(price, count) {
    alert("💳 Redirecting to Razorpay secure UPI engine for amount ₹" + price);
    setTimeout(() => {
        userProfile.diamonds += count;
        alert(`✅ Razorpay Transaction Successful! Automatically routing back to Dashboard. Processed +${count} Diamonds.`);
        updateBalancesUI();
    }, 1200);
}

// ================= UNIQUE UI/UX REWARDS CLAIM SYSTEM =================
function claimReward(cashValue, index) {
    alert("💖 Reward " + cashValue + " claimed successfully! Dispatched directly to Winning Balance.");
    
    let numericVal = parseInt(cashValue.replace(/[^0-9]/g, '')) || 0;
    userProfile.winnings += numericVal;
    
    rewardsMatrix[index].status = "locked"; 
    
    updateBalancesUI();
    renderRewards();
}

function renderRewards() {
    const list = document.getElementById('rewards-list');
    list.innerHTML = "";
    rewardsMatrix.forEach((item, index) => {
        let disabledAttr = item.status === 'locked' ? 'disabled' : '';
        let btnText = item.status === 'locked' ? '✅ Claimed' : 'Claim';
        
        list.innerHTML += `
            <div class="reward-item-row">
                <span>👥 ${item.members} (${item.cash})</span>
                <button class="claim-btn" ${disabledAttr} onclick="claimReward('${item.cash}', ${index})">${btnText}</button>
            </div>
        `;
    });
}

function toggleDashboardMic() {
    lobbyMicOn = !lobbyMicOn;
    const micBtn = document.getElementById('dash-mic');
    if(lobbyMicOn) {
        micBtn.className = "dashboard-mic-btn green-mic"; micBtn.innerText = "Lobby Mic: ON (Green)";
    } else {
        micBtn.className = "dashboard-mic-btn red-mic"; micBtn.innerText = "Lobby Mic: OFF (Red)";
    }
}

function handleReq(btn, accepted) {
    if(accepted) {
        if(friendsListCount >= 300) { alert("❌ Friend List Full! Max 300 members limit reached."); return; }
        friendsListCount++;
        document.getElementById('friend-counter-text').innerText = friendsListCount;
        
        // No friends text ko chupane ke liye
        if(document.getElementById('no-friends-text')) {
            document.getElementById('no-friends-text').remove();
        }
        alert("🤝 Request accepted! Added member under 300 limits tracking slots.");
    }
    btn.closest('.request-item').remove();
    
    // Agar requests khali ho jaye
    if(document.getElementById('requests-box').children.length === 0) {
        document.getElementById('requests-box').innerHTML = `<p style="font-size: 12px; color: #888; text-align: center; padding: 10px;">No pending friend requests.</p>`;
    }
}

function copyReferral() { alert("🔗 Referral link captured successfully!"); }
function inviteToLobby(name) { alert(`📨 Group audio lobby invitation dispatched to: ${name}`); }
// Sateek clear friend logic ke sath custom request function connect kiya
function sendCustomFriendRequest(name) { alert(`📨 Friend request triggered successfully to referral member: ${name}!`); }

// ================= EMERGENCY EXIT MATCH FUNCTION =================
function exitMatch() {
    let confirmExit = confirm("⚠️ Are you sure you want to exit the match and return to Dashboard?");
    if (confirmExit) {
        if (timerId) {
            clearInterval(timerId);
        }
        gameActive = false;
        
        document.getElementById('gameplay-screen').style.display = 'none';
        document.getElementById('start-overlay').style.display = 'none';
        
        loadDashboard();
        alert("🚪 You exited the match. Returned to TapTap Pro Dashboard!");
    }
}

// ================= DYNAMIC GALLERY READERS & REAL PROFILE FUNCTIONS =================
function editProfileName() {
    let fee = userProfile.nameChangesLeft > 0 ? 0 : 30;
    if(fee > 0 && userProfile.diamonds < fee) {
        alert("❌ You need 30 Diamonds to change your name now!"); return;
    }
    
    let newName = prompt("Enter your new name:");
    if(!newName || newName.trim() === "") return;
    
    if(fee > 0) {
        userProfile.diamonds -= fee;
        alert("💎 30 Diamonds deducted for name customization!");
    } else {
        userProfile.nameChangesLeft--;
    }
    
    userProfile.name = newName;
    document.getElementById('display-name').innerText = newName;
    document.getElementById('slot-1').innerText = newName + " (You)";
    
    document.getElementById('free-limit-text').innerText = userProfile.nameChangesLeft > 0 ? userProfile.nameChangesLeft + " Free Changes Left" : "Cost: 30 Diamonds / Change";
    updateBalancesUI();
}

function triggerAvatarUpload() { 
    document.getElementById('avatar-input').click(); 
}

function uploadAvatar(event) {
    let fee = userProfile.avatarChangesLeft > 0 ? 0 : 30;
    if(fee > 0 && userProfile.diamonds < fee) {
        alert("❌ You need 30 Diamonds to change profile photo!"); return;
    }
    
    if (!event.target.files || !event.target.files[0]) return;
    
    let reader = new FileReader();
    reader.onload = function() {
        document.getElementById('user-avatar').src = reader.result;
        
        if(fee > 0) {
            userProfile.diamonds -= fee;
            alert("💎 30 Diamonds deducted for photo change!");
        } else {
            userProfile.avatarChangesLeft--;
        }
        updateBalancesUI();
    }
    reader.readAsDataURL(event.target.files[0]);
      }
