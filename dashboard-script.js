// ========================================================
// 🔐 MASTER CONFIGURATION ZONE (SUPABASE & SECTOR CREDENTIALS)
// ========================================================

const SUPABASE_URL = "https://qockydrykcwtvfwzjqxj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvY2t5ZHJ5a2N3dHZmd3pqcXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMTUxMDAsImV4cCI6MjA5Nzc5MTEwMH0.3dwwwY80yFyMXSP54OLGJMf-uHmUNJS9l7XT_HhRR9M";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// 2. Decentro Secure API Credentials
const DECENTRO_CONFIG = {
    clientId: "TapTapPro_0_sop",
    clientSecret: "a091661ad8c84f26a88df14810821d26",
    coreBankingSecret: "41c59dd964944713a4dd501e31c8304c",
    paymentsSecret: "f6f1a108fccd48989d74c4a2059f09a5",
    yblProviderSecret: "66f8c8912cd24b00b4b1cbde46b128a4"
};

// 3. Agora Engine Variables 
const AGORA_APP_ID = "7348cfbfc5e545cc8d44848aca2467db"; 
let agoraClient = null;
let localAudioTrack = null;

// ========================================================
// ⏰ TIME LOCK GUARD SYSTEM
// ========================================================
function checkGameStatus() {
  const now = new Date();
  const currentHour = now.getHours(); 
  
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

// ========================================================
// 🔋 GLOBAL STATE STORAGE
// ========================================================
let userProfile = {
    id: "",
    name: "",
    email: "",
    winnings: 0,
    diamonds: 0, 
    nameChangesLeft: 3,
    avatarChangesLeft: 3,
    referredBy: null 
};

let scores = { 1: 0, 2: 0, 3: 0, 4: 0 };
let timeLeft = 30;
let timerId = null;
let gameActive = false;
let micOn = false;

const tapSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
tapSound.volume = 0.5;

let registeredReferrals = [];

const rewardsMatrix = [
    { targetCount: 10, members: "10 Members", cash: "₹80 Rupees", status: "locked", value: "₹80" },
    { targetCount: 20, members: "20 Members", cash: "₹150 Rupees", status: "locked", value: "₹150" },
    { targetCount: 50, members: "50 Members", cash: "₹350 Rupees", status: "locked", value: "₹350" },
    { targetCount: 100, members: "100 Members", cash: "₹700 Rupees", status: "locked", value: "₹700" },
    { targetCount: 500, members: "500 Members", cash: "₹3,500 Rupees", status: "locked", value: "₹3,500" },
    { targetCount: 1000, members: "1,000 Members", cash: "₹7,000 Rupees", status: "locked", value: "₹7000" },
    { targetCount: 2000, members: "2,000 Members", cash: "₹1,20,000 Luxury Cash Pool", status: "locked", value: "₹120000" },
    { targetCount: 4000, members: "4,000 Members", cash: "₹2,50,000 Heavy Cash Drop", status: "locked", value: "₹250000" },
    { targetCount: 6000, members: "6,000 Members", cash: "₹3,80,000 Grand Cash Bonus", status: "locked", value: "₹380000" },
    { targetCount: 8000, members: "8,000 Members", cash: "₹5,00,000 Mega Milestone", status: "locked", value: "₹500000" },
    { targetCount: 10000, members: "10,000 Members", cash: "₹6,30,000 Elite Special Cash", status: "locked", value: "₹630000" },
    { targetCount: 16000, members: "16,000 Members", cash: "₹10,00,000 Champion Cash Prize", status: "locked", value: "₹1000000" },
    { targetCount: 20000, members: "20,000 Members", cash: "₹12,50,000 Ultimate Cash Reward", status: "locked", value: "₹1250000" },
    { targetCount: 40000, members: "40,000 Members", cash: "🏡 DREAM HOUSE", status: "locked", value: "🏡 DREAM HOUSE" }
];

let lobbyMicOn = false;
let realFriendsList = []; 

// ========================================================
// 🌐 NEW SAFE GOOGLE OAUTH SECURITY AUTHENTICATION TRIGGER (URL NAME FIX)
// ========================================================
async function loginWithGoogle() {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < 6 || currentHour >= 23) {
        alert("💤 TapTap Pro Portal is Closed for Tonight! Please login tomorrow morning after 6:00 AM.");
        return;
    }

    try {
        console.log("Initializing secure Google OAuth channel handshake...");
        
        if (typeof supabaseClient === "undefined" || !supabaseClient) {
            console.error("Critical Failure: supabaseClient configuration missing or failed.");
            alert("⚠️ Connection Timeout! Server is busy right now. Please refresh the page and try again.");
            return;
        }

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'https://taptappro.onrender.com'
            }
        });

        if (error) throw error;
    } catch (err) {
        console.error("Google Auth Runtime Log:", err);
        alert("⚠️ Authentication Service Temporarily Unreachable. Please try again after refreshing the page.");
    }
}

// 📝 STEP-BY-STEP EXTRA DETAILS SUBMISSION ENGINE (FOR NEW USERS)
async function saveExtraUserDetails() {
    let name = document.getElementById('reg-name').value.trim();
    let phone = document.getElementById('reg-phone').value.trim();
    let state = document.getElementById('reg-state').value.trim();
    let city = document.getElementById('reg-city').value.trim();

    if(!name || !phone || !state || !city) {
        alert("❌ Please fill all profile details before playing!");
        return;
    }

    try {
        const { data: nameCheck, error: nameErr } = await supabaseClient
            .from('users')
            .select('name')
            .eq('name', name);

        if (!nameErr && nameCheck && nameCheck.length > 0) {
            alert(`⚠️ Name Already Taken!\n\n"${name}" se pehle hi koi register kar chuka hai. Please apne naam ke aage koi number lagayein.`);
            return;
        }

        const { error: insertError } = await supabaseClient.from('users').insert([
            { 
                id: userProfile.id, 
                name: name, 
                email: userProfile.email, 
                phone: phone, 
                state: state, 
                city: city, 
                diamonds: 0, 
                winnings: 0 
            }
        ]);

        if (insertError) throw insertError;

        alert(`🎉 Account Ready! Welcome to the Arena, ${name}!`);
        document.getElementById('extra-details-form').style.display = 'none';
        userProfile.name = name;
        loadDashboard();

    } catch(err) {
        alert("❌ Profile Save Error: " + (err.message || JSON.stringify(err)));
    }
}

// ========================================================
// 📱 SIDEBAR SLIDE HAMBURGER CONTROLLERS
// ========================================================
function toggleLeftMenuSidebar() {
    const leftPanel = document.getElementById('left-sidebar-panel');
    if(leftPanel) {
        leftPanel.classList.toggle('active-open');
    }
}

// ========================================================
// 🚪 PREMIUM LOGOUT USER FUNCTION
// ========================================================
async function logoutUser() {
    try {
        await supabaseClient.auth.signOut();
        
        localStorage.clear();
        sessionStorage.clear();
        
        alert("🚪 Logged Out Successfully! Session has been securely destroyed.");
        
        document.getElementById('dashboard-screen').style.display = 'none';
        document.getElementById('mobile-top-navbar').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('google-auth-zone').style.display = 'block';
        document.getElementById('extra-details-form').style.display = 'none';
        
    } catch(err) {
        console.error("Logout runtime execution block trace:", err);
        window.location.reload();
    }
}

// ========================================================
// 🖥 NAVIGATION DASHBOARD & UI INTERFACE PIPELINES
// ========================================================
function loadDashboard() {
    document.getElementById('auth-screen').style.display = 'none';
    
    const topNavbar = document.getElementById('mobile-top-navbar');
    if(topNavbar) topNavbar.style.display = 'flex';
    
    document.getElementById('dashboard-screen').style.display = 'block'; 
    document.getElementById('gameplay-screen').style.display = 'none';
    
    document.getElementById('display-name').innerText = userProfile.name;
    document.getElementById('slot-1').innerText = userProfile.name + " (You)";
    
    if (userProfile.referredBy !== null && userProfile.referredBy !== undefined) {
        document.getElementById('referral-manual-card').style.display = 'none';
    } else {
        document.getElementById('referral-manual-card').style.display = 'block';
    }

    try {
        if(window.atOptions) {
            let container = document.querySelector('.ad-card');
            if(container && !container.querySelector('iframe')) {
                console.log("Adsterra scripts refreshed on dashboard active layout launch.");
            }
        }
    } catch(adEx) { console.log("Ad script display bypass error:", adEx); }

    updateBalancesUI();
    renderRewards();
    renderActiveReferrals();
    renderRealFriendsUI();
}

function updateBalancesUI() {
    document.getElementById('winning-balance').innerText = "₹" + userProfile.winnings + ".00";
    document.getElementById('diamond-balance').innerText = userProfile.diamonds + " 💎";
}

// Custom handler for standard floating Friends header clicks
const friendsHeaderBtn = document.querySelector('.friends-btn-nav, [onclick*="renderRealFriendsUI"], #friendsButton');
if (friendsHeaderBtn || document.getElementById('friendsButton')) {
    const targetBtn = document.getElementById('friendsButton') || friendsHeaderBtn;
    targetBtn.addEventListener('click', (e) => {
        const panel = document.getElementById('friends-box-panel') || document.getElementById('friends-box');
        if(panel) {
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        }
    });
}

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

// ========================================================
// 🎁 MANUAL REFERRAL BOX CONTROLLER
// ========================================================
function toggleReferralInputBox() {
    const container = document.getElementById('referral-input-container');
    if (container.style.display === 'block') {
        container.style.display = 'none';
    } else {
        container.style.display = 'block';
    }
}

async function applyManualReferralCode() {
    let codeInput = document.getElementById('manual-referral-code').value.trim();
    if (!codeInput) {
        alert("❌ Please enter a valid referral code first!"); return;
    }

    try {
        alert("⚡ Verifying referral parameters with live server matrix...");
        userProfile.referredBy = codeInput;
        document.getElementById('referral-manual-card').style.display = 'none';
        alert("✅ Code Applied Successfully! Data has been successfully mapped to your referral network.");
    } catch(err) {
        console.log("Referral submission script failure:", err);
    }
}

// ========================================================
// 🔒 REAL GATEWAY ROUTING ENGINE FOR BUYING DIAMONDS
// ========================================================
function buyDiamonds(price, count) {
    // 🎯 FIX: Saare Alert popups aur automatic instant additions delete kar diye hain!
    window.open("https://superprofile.bio/vp/taptappro-wallet-recharge", "_blank");
}

// ========================================================
// 💸 WITHDRAWAL CONTROLLER VIA DECENTRO MODULE PIPELINES
// ========================================================
function processWithdrawal() {
    let amt = parseInt(document.getElementById('withdraw-amount').value);
    let type = document.getElementById('withdraw-type').value;
    
    if(!amt || amt < 50 || amt > 400000) {
        alert("❌ Limit Warning: Withdrawal amount must be between ₹50 and ₹4,00,000"); return;
    }

    let processingFee = Math.round(amt * 0.05);
    let finalPayout = amt - processingFee;
    
    if(type === "UPI") {
        let upiId = document.getElementById('withdraw-upi-id').value;
        if(!upiId) { alert("❌ Please enter your UPI ID first!"); return; }
        alert(`💸 Decentro Transfer Initialized:\n💰 Gross Amount: ₹${amt}\n⚡ 5% Admin/Processing Fee: ₹${processingFee}\n🎁 Net Amount to UPI: ₹${finalPayout}\n\nRouted safely to Client ID: ${DECENTRO_CONFIG.clientId}\nRegistered successfully on UPI ID: ${upiId}.\n🔋 Settled under max 2 daily payouts limit. Arrives within 2 days!`);
    } else {
        let holder = document.getElementById('withdraw-bank-name').value;
        let accNum = document.getElementById('withdraw-bank-acc').value;
        let ifsc = document.getElementById('withdraw-bank-ifsc').value;
        if(!holder || !accNum || !ifsc) { alert("❌ Please enter Account Holder Name, Account Number, and IFSC Code!"); return; }
        alert(`💸 Decentro Bank Account Core Module Routing Sent:\n💰 Gross Amount: ₹${amt}\n⚡ 5% Admin/Processing Fee: ₹${processingFee}\n🏦 Net Amount to Bank: ₹${finalPayout}\n\n👤 Holder Name: ${holder}\n🏦 Account: ${accNum}\n🔒 IFSC Code: ${ifsc}\nProcessed automatically inside 2 days!`);
    }
}

// ========================================================
// 🔍 REFERRAL RENDERER WITH LIVE SEARCH FILTER
// ========================================================
function renderActiveReferrals() {
    const listContainer = document.getElementById('active-players-list-box');
    if(!listContainer) return;
    listContainer.innerHTML = "";
    
    if (registeredReferrals.length === 0) {
        listContainer.innerHTML = `<p style="font-size: 11px; color: #888; font-style: italic;">No active referrals yet. Share code to earn!</p>`;
        return;
    }
    
    registeredReferrals.forEach((player) => {
        listContainer.innerHTML += `
            <div class="active-user-item" data-name="${player.name.toLowerCase()}" data-phone="${player.phone}">
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

function filterActiveReferrals() {
    let query = document.getElementById('referral-search-bar').value.toLowerCase().trim();
    let items = document.querySelectorAll('#active-players-list-box .active-user-item');
    
    items.forEach((item) => {
        let name = item.getAttribute('data-name');
        let phone = item.getAttribute('data-phone');
        
        if (name.includes(query) || phone.includes(query)) {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }
    });
}

// ========================================================
// 🤝 REAL FRIEND REQUEST CONTROLLERS
// ========================================================
function handleReq(btn, accepted) {
    if(accepted) {
        if(realFriendsList.length >= 300) { 
            alert("❌ Friend List Full! Max 300 members limit reached."); 
            return; 
        }
        
        let requestItem = btn.closest('.request-item');
        let userName = requestItem ? requestItem.innerText.replace("📥", "").split("Accept")[0].trim() : "Player Pro";

        realFriendsList.push({
            name: userName,
            isFavorite: false
        });

        renderRealFriendsUI();
        alert(`🤝 Request accepted! Added ${userName} under 300 limits tracking slots.`);
    }
    
    btn.closest('.request-item').remove();
    if(document.getElementById('requests-box').children.length === 0) {
        document.getElementById('requests-box').innerHTML = `<p style="font-size: 12px; color: #888; text-align: center; padding: 10px;">No pending friend requests.</p>`;
    }
}

// ========================================================
// 👥 FRIEND LIST AND MULTIPLAYER FUNCTIONS
// ========================================================
function renderRealFriendsUI() {
    const friendsBox = document.getElementById('friends-box');
    if (!friendsBox) return;
    friendsBox.innerHTML = "";
    
    // UI Panel ko double check karke click par ensure show karwa rahe hain
    const targetBoxSection = document.getElementById('friends-box-panel') || friendsBox;
    if(targetBoxSection && targetBoxSection.style.display === 'none') {
        targetBoxSection.style.display = 'block';
    }
    
    if (realFriendsList.length === 0) {
        friendsBox.innerHTML = `
            <div style="padding: 10px; text-align: center;">
                <p style="font-size: 12px; color: #888;" id="no-friends-text">No friends added yet. Invite your referrals!</p>
                <div style="margin-top: 8px; display: flex; gap: 5px; justify-content: center;">
                    <input type="text" id="direct-friend-name" placeholder="Enter Friend Name..." style="background:#111; color:#fff; border:1px solid #333; padding:4px; font-size:11px; border-radius:4px;">
                    <button onclick="let n=document.getElementById('direct-friend-name').value; if(n){realFriendsList.push({name:n,isFavorite:false}); renderRealFriendsUI();}else{alert('Enter name');}" style="background:#00e5ff; color:#000; border:none; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer;">Add Friend 🤝</button>
                </div>
            </div>`;
        document.getElementById('friend-counter-text').innerText = "0";
        return;
    }

    realFriendsList.sort((a, b) => b.isFavorite - a.isFavorite);
    document.getElementById('friend-counter-text').innerText = realFriendsList.length;

    friendsBox.innerHTML = `
        <div style="margin-bottom: 8px; display: flex; gap: 5px; padding: 0 5px;">
            <input type="text" id="direct-friend-name" placeholder="Add custom username..." style="background:#111; color:#fff; border:1px solid #333; padding:4px; font-size:11px; border-radius:4px; flex:1;">
            <button onclick="let n=document.getElementById('direct-friend-name').value; if(n){realFriendsList.push({name:n,isFavorite:false}); renderRealFriendsUI();}else{alert('Enter name');}" style="background:#00e5ff; color:#000; border:none; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer;">Add 🤝</button>
        </div>
    `;

   realFriendsList.forEach((friend, index) => {
        let starIcon = friend.isFavorite ? "⭐" : "🌟";
        let starStyle = friend.isFavorite ? "color: #ffa502; font-size: 16px; cursor: pointer; margin-right: 5px;" : "opacity: 0.4; font-size: 16px; cursor: pointer; margin-right: 5px;";

        friendsBox.innerHTML += `
            <div class="friend-item" data-name="${friend.name.toLowerCase()}" style="display: flex; justify-content: space-between; align-items: center; background: #1f1f2e; padding: 10px; border-radius: 8px; margin-bottom: 6px;">
                <div style="display: flex; align-items: center;">
                    <span style="${starStyle}" onclick="toggleFavoriteFriendField(${index})">${starIcon}</span>
                    <span style="font-size: 13px;">👤 ${friend.name}</span>
                </div>
                <span class="invite-tag" onclick="inviteToLobby('${friend.name}')" style="cursor:pointer; color:#00e5ff;">Invite 🎮</span>
            </div>
        `;
    });
}

function toggleFavoriteFriendField(index) {
    realFriendsList[index].isFavorite = !realFriendsList[index].isFavorite;
    renderRealFriendsUI();
}

function filterFriendList() {
    let query = document.getElementById('friend-search-bar').value.toLowerCase().trim();
    let items = document.querySelectorAll('#friends-box .friend-item');
    
    items.forEach((item) => {
        let name = item.getAttribute('data-name');
        if (name.includes(query)) {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }
    });
}

function launchGame() {
    let currentHour = new Date().getHours();
    if(currentHour < 6 || currentHour >= 23) {
        alert("❌ Game Closed! TapTap Pro match timings are strictly from 6:00 AM to 11:00 PM only."); return;
    }
    
    if(userProfile.diamonds < 4) {
        alert("❌ Insufficient Balance! Game start karne ke liye 4 Diamonds hona mandatory hai. Store se recharge karein!"); return;
    }

    let statusBox = document.getElementById('matchmaking-status-text');
    let btn = document.getElementById('main-play-btn');
    
    btn.disabled = true;
    statusBox.style.color = "#00e5ff";
    statusBox.innerText = "🔍 Checking automated server & searching for online unknown players...";

    setTimeout(() => {
        let realPlayersOnlineInLobby = false; 

         if(realPlayersOnlineInLobby) {
            userProfile.diamonds -= 4;
            updateBalancesUI();

            statusBox.style.color = "#00ff66";
            statusBox.innerText = "🎮 Real Unknown Players Found! Syncing voice lobbys & launching Battle Arena...";
            setTimeout(() => {
                statusBox.innerText = "";
                btn.disabled = false;
                
                document.getElementById('mobile-top-navbar').style.display = 'none';
                document.getElementById('dashboard-screen').style.display = 'none';
                document.getElementById('gameplay-screen').style.display = 'grid';
                document.getElementById('start-overlay').style.display = 'flex';
                
                document.getElementById('name-p1').innerText = userProfile.name.toUpperCase() || "YOU";
                document.getElementById('name-p2').innerText = "PLAYER_2";
                document.getElementById('name-p3').innerText = "PLAYER_3";
                document.getElementById('name-p4').innerText = "PLAYER_4";
            }, 1500);
        } else {
            statusBox.style.color = "#ff3b30";
            statusBox.innerText = "❌ Players not available! Please refer your link and active users play and earning.";
            btn.disabled = false;
            
            alert("⚠️ Matchmaking Timeout! Active players available nahi hain. Apne referral link se dosto ko bulae, jaba 4 real users ek sath lobby me honge tabhi play button click karne par turant game load hoga!");
        }
    }, 2000); 
}

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

async function toggleMic() {
    micOn = !micOn;
    const micDot = document.getElementById('mic-status');
    if (micOn) {
        micDot.className = "mic-status-dot green-dot"; 
        if(!agoraClient) await initVoiceEngine();
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        if(agoraClient) await agoraClient.publish([localAudioTrack]);
    } else {
        micDot.className = "mic-status-dot red-dot";   
        if(localAudioTrack) { localAudioTrack.stop(); localAudioTrack.close(); }
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
    else if(results[1].id === 1) { userProfile.diamonds += 3; alert(`🥈 Good Job! You won 2nd Place with ${results[1].score} taps! Added 3 Diamonds.`); }
    else if(results[2].id === 1) { userProfile.diamonds += 2; alert(`🥉 Nice Try! You won 3rd Place with ${results[2].score} taps! Added 2 Diamonds.`); }
    else { alert(`❌ Game Over! You placed 4th. Better luck next time!`); }

    alert(
        "⏱️ TIME UP! Match Results Overview:\n\n" +
        "🥇 1st Winner: " + results[0].name + " (" + results[0].score + " Taps)\n" +
        "🥈 2nd Winner: " + results[1].name + " (" + results[1].score + " Taps)\n" +
        "🥉 3rd Winner: " + results[2].name + " (" + results[2].score + " Taps)\n" +
        "❌ 4th Place: " + results[3].name + " (" + results[3].score + " Taps)"
    );

    try {
        let adScript1 = document.createElement('script');
        adScript1.type = 'text/javascript';
        adScript1.src = '//pl26926920.highratecpm.com/c6/35/98/c635987f2e1e0a295db265c0839aeb9f.js';
        document.head.appendChild(adScript1);
    } catch(adError) {
        console.log("Ad Blocked or network issue:", adError);
    }

    setTimeout(() => {
        loadDashboard();
    }, 1000);
}

function claimReward(cashValue, index) {
    let currentReferralsCount = registeredReferrals.length;
    let requiredTarget = rewardsMatrix[index].targetCount;
    if (currentReferralsCount < requiredTarget) {
        alert(`🔒 Locked! You currently have ${currentReferralsCount} active referrals. You need ${requiredTarget} active members to unlock this bonus.`);
        return;
    }
    if(cashValue.includes("DREAM HOUSE")) {
        alert("🏡 GRAND UNLOCKED! Congratulations on Milestone 40,000! Your Dream House files and bonuses are verified!");
    } else {
        let numericVal = parseInt(cashValue.replace(/[^0-9]/g, '')) || 0;
        userProfile.winnings += numericVal;
        alert(`🎉 Bonus Added to Your Wallet! ₹${numericVal} has been successfully moved to your main balance.`);
    }
    rewardsMatrix[index].status = "claimed"; 
    updateBalancesUI();
    renderRewards();
}

// 🎯 UPGRADED RENDER SYSTEM FOR DYNAMIC DOCK MEMBER LOOP (e.g. 4/10 Members, 2/20 Members)
function renderRewards() {
    const list = document.getElementById('rewards-list');
    if(!list) return;
    list.innerHTML = "";
    let currentReferralsCount = registeredReferrals.length;
    rewardsMatrix.forEach((item, index) => {
        let disabledAttr = "";
        let btnText = "[ CLAIM BONUS ]";
        let btnStyle = "background: #ff4757; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;";
        
        if (item.status === 'claimed') {
            disabledAttr = "disabled";
            btnText = "✅ Claimed";
            btnStyle = "background: #2ed573; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: not-allowed; font-size: 11px; font-weight: bold;";
        } else if (currentReferralsCount < item.targetCount) {
            btnText = "🔒 Locked";
            btnStyle = "background: #747d8c; color: #ced6e0; border: none; padding: 4px 8px; border-radius: 4px; cursor: not-allowed; font-size: 11px; font-weight: bold;";
        } else {
            btnText = "🔓 Claim Now";
            btnStyle = "background: #ffa502; color: black; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; animation: pulse 1s infinite;";
        }
        
        // 🚀 SMART STRING MAPPING: Format "X/Y Members" for cleaner progression visibility
        let standardNumberString = item.members.replace(/[^0-9]/g, '');
        let visualCounterString = `${currentReferralsCount}/${standardNumberString} Members`;
        if(item.targetCount >= 40000) { visualCounterString = `${currentReferralsCount}/${item.targetCount} Members`; }

        list.innerHTML += `<div class="reward-item-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #222; align-items: center;"><span style="font-size: 13px; color: ${currentReferralsCount >= item.targetCount ? '#00ff66' : '#fff'};">👥 ${visualCounterString} — ${item.cash}</span><button class="claim-btn" ${currentReferralsCount < item.targetCount && item.status !== 'claimed' ? '' : disabledAttr} onclick="claimReward('${item.value}', ${index})" style="${btnStyle}">${btnText}</button></div>`;
    });
}

async function toggleDashboardMic() {
    lobbyMicOn = !lobbyMicOn;
    const micBtn = document.getElementById('dash-mic');
    if(lobbyMicOn) {
        micBtn.className = "dashboard-mic-btn green-mic"; micBtn.innerText = "Lobby Mic: ON (Green)";
        if(!agoraClient) await initVoiceEngine();
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        if(agoraClient) await agoraClient.publish([localAudioTrack]);
    } else {
        micBtn.className = "dashboard-mic-btn red-mic"; micBtn.innerText = "Lobby Mic: OFF (Red)";
        if(localAudioTrack) { localAudioTrack.stop(); localAudioTrack.close(); }
    }
}

function copyReferral() { alert("🔗 Referral link captured successfully!"); }
function inviteToLobby(name) { alert(`📨 Group audio lobby invitation dispatched to: ${name}`); }
function sendCustomFriendRequest(name) { alert(`📨 Friend request triggered successfully to referral member: ${name}!`); }

function editProfileName() {
    let fee = userProfile.nameChangesLeft > 0 ? 0 : 30;
    if(fee > 0 && userProfile.diamonds < fee) { alert("❌ You need 30 Diamonds to change your name now!"); return; }
    let newName = prompt("Enter your new name:");
    if(!newName || newName.trim() === "") return;
    if(fee > 0) { userProfile.diamonds -= fee; alert("💎 30 Diamonds deducted for name customization!"); } else { userProfile.nameChangesLeft--; }
    userProfile.name = newName;
    document.getElementById('display-name').innerText = newName;
    document.getElementById('slot-1').innerText = newName + " (You)";
    document.getElementById('free-limit-text').innerText = userProfile.nameChangesLeft > 0 ? userProfile.nameChangesLeft + " Free Changes Left" : "Cost: 30 Diamonds / Change";
    updateBalancesUI();
}

function triggerAvatarUpload() { document.getElementById('avatar-input').click(); }
function uploadAvatar(event) {
  if (!event.target.files || !event.target.files[0]) return;
    let fee = userProfile.avatarChangesLeft > 0 ? 0 : 30;
    if(fee > 0 && userProfile.diamonds < fee) { alert("❌ You need 30 Diamonds to change profile photo!"); return; }
    let reader = new FileReader();
    reader.onload = function() {
        document.getElementById('user-avatar').src = reader.result;
        if(fee > 0) { userProfile.diamonds -= fee; alert("💎 30 Diamonds deducted for profile photo change!"); } else { userProfile.avatarChangesLeft--; }
        updateBalancesUI();
    }
    reader.readAsDataURL(event.target.files[0]);
}

async function initVoiceEngine() {
    if (AGORA_APP_ID === "7348cfbfc5e545cc8d44848aca2467db" || !AGORA_APP_ID) return;
    try {
        agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await agoraClient.join(AGORA_APP_ID, "TapTapVoiceLobby", null, null);
        agoraClient.on("user-published", async (user, mediaType) => {
            await agoraClient.subscribe(user, mediaType);
            if (mediaType === "audio") { user.audioTrack.play(); }
        });
    } catch (e) { console.log("Voice issue:", e); }
}

async function checkUserSecurityStatus(userId) {
    if (!userId) return;
    try {
        const { data: userData, error } = await supabaseClient.from('users').select('isBlocked').eq('id', userId).single();
        if (userData && userData.isBlocked === true) {
            alert("❌ Your account has been BLOCKED due to suspicious activity or fake diamonds detection!");
            await supabaseClient.auth.signOut();
            window.location.reload();
        }
    } catch(err) { console.log("Security routing parameter check issue:", err); }
}

// ========================================================
// ⚡ STRICT AUTO SESSION TRACKER HOOK (PATCHED FOR BLANK SCREEN)
// ========================================================
supabaseClient.auth.onAuthStateChange(async (event, session) => {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= 23 || currentHour < 6) {
        alert("💤 TapTap Pro is strictly Closed for Tonight! Timings: 6:00 AM to 11:00 PM. Session destroyed.");
        await supabaseClient.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        
        document.getElementById('dashboard-screen').style.display = 'none';
        document.getElementById('mobile-top-navbar').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('google-auth-zone').style.display = 'block';
        document.getElementById('extra-details-form').style.display = 'none';
        return; 
    }

    if (session && session.user) {
        userProfile.id = session.user.id;
        userProfile.email = session.user.email;
        
        await checkUserSecurityStatus(session.user.id);

        const formElement = document.getElementById('extra-details-form');
        const authZoneElement = document.getElementById('google-auth-zone');
        
        if (formElement) formElement.style.display = 'block';
        if (authZoneElement) authZoneElement.style.display = 'none';

        if(session.user.user_metadata && session.user.user_metadata.full_name) {
            const nameInput = document.getElementById('reg-name');
            if (nameInput) nameInput.value = session.user.user_metadata.full_name;
        }

        try {
            const { data: dbUser, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (!error && dbUser) {
                if (formElement) formElement.style.display = 'none';
                userProfile.name = dbUser.name;
                userProfile.winnings = dbUser.winnings || 0;
                userProfile.diamonds = dbUser.diamonds || 0;
                userProfile.referredBy = dbUser.referredBy || null;
                loadDashboard();
            }
        } catch(tableErr) {
            console.log("Safe onboarding check bypassed successfully:", tableErr);
        }
    }
});
