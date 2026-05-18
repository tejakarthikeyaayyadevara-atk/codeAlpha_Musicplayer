// Master Application Dataset Track Hub
const globalTrackCatalog = [
    { id: 1, title: "Summer Chill Vibes", artist: "Lofi Creative", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", art: "https://picsum.photos/200?random=1" },
    { id: 2, title: "Retro Electronic Drive", artist: "Synth Runner", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", art: "https://picsum.photos/200?random=2" },
    { id: 3, title: "Acoustic Horizon", artist: "Guitar Traveler", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", art: "https://picsum.photos/200?random=3" },
    { id: 4, title: "Cyber Ambient Nebula", artist: "Space Drone", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", art: "https://picsum.photos/200?random=4" }
];

let activeTrackList = [...globalTrackCatalog];
let trackIndex = 0;
let isPlaying = false;
let generatedOTP = null;

// Element Target Anchors
const audio = document.getElementById('main-audio');
const playPauseBtn = document.getElementById('btn-play-pause');
const title = document.getElementById('track-title');
const artist = document.getElementById('track-artist');
const art = document.getElementById('track-art');
const slider = document.getElementById('progress-slider');
const currentTimeDisplay = document.getElementById('current-time');
const durationDisplay = document.getElementById('total-duration');
const playlistUl = document.getElementById('playlist-ul');
const customPlaylistsUl = document.getElementById('custom-playlists-ul');

// ================= SECTION 1: OTP LOGIC AUTH ENGINE =================
function requestOTP() {
    const phone = document.getElementById('user-phone').value;
    if (phone.length !== 10 || isNaN(phone)) {
        alert("Please enter a valid 10-digit mobile phone number.");
        return;
    }
    
    // Simulate generation step 
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Alert presentation tracking mock system
    alert(`[SMS Gateway Mock System] \nOTP Sent to +91 ${phone}\nYour verification activation key code is: ${generatedOTP}`);
    
    document.getElementById('phone-input-group').classList.add('hidden');
    document.getElementById('otp-input-group').classList.remove('hidden');
    document.getElementById('auth-subtitle').innerText = "Enter the 6-digit verification code below:";
}

function verifyOTP() {
    const enteredOTP = document.getElementById('user-otp').value;
    if (enteredOTP === generatedOTP && generatedOTP !== null) {
        document.getElementById('auth-overlay').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('display-user-phone').innerText = "+91 " + document.getElementById('user-phone').value;
        
        // App Load Triggers
        initializeUserPlaylists();
        buildTrackDirectoryUI(activeTrackList);
        loadTrack(0);
    } else {
        alert("Invalid verification code match! Try entering the code again.");
    }
}

// ================= SECTION 2: SEARCH CAPABILITY MECHANIC =================
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    activeTrackList = globalTrackCatalog.filter(track => 
        track.title.toLowerCase().includes(query) || 
        track.artist.toLowerCase().includes(query)
    );
    
    document.getElementById('directory-heading').innerText = query ? `Search Results (${activeTrackList.length})` : "All Available Tracks";
    buildTrackDirectoryUI(activeTrackList);
    
    if(activeTrackList.length > 0) {
        trackIndex = 0;
        loadTrack(trackIndex);
    }
}

// ================= SECTION 3: PLAYLIST MANAGEMENT ENGINE =================
function initializeUserPlaylists() {
    if (!localStorage.getItem('userPlaylists')) {
        localStorage.setItem('userPlaylists', JSON.stringify({ "Favorites Blend": [1, 3] }));
    }
    renderPlaylistSidebar();
}

function createNewPlaylist() {
    const input = document.getElementById('new-playlist-name');
    const name = input.value.trim();
    if (!name) return;

    let playlists = JSON.parse(localStorage.getItem('userPlaylists'));
    if (playlists[name]) {
        alert("A library list with that exact name already exists!");
        return;
    }

    playlists[name] = [];
    localStorage.setItem('userPlaylists', JSON.stringify(playlists));
    input.value = "";
    renderPlaylistSidebar();
}

function renderPlaylistSidebar() {
    customPlaylistsUl.innerHTML = "";
    let playlists = JSON.parse(localStorage.getItem('userPlaylists'));
    
    // Default All Tracks view selection tab
    const defaultLi = document.createElement('li');
    defaultLi.innerHTML = `<i class="fas fa-compact-disc"></i> <span>All Tracks Library</span>`;
    defaultLi.onclick = () => {
        activeTrackList = [...globalTrackCatalog];
        document.getElementById('directory-heading').innerText = "All Available Tracks";
        buildTrackDirectoryUI(activeTrackList);
        loadTrack(0);
    };
    customPlaylistsUl.appendChild(defaultLi);

    // Render localized collections
    for (let pName in playlists) {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-music"></i> <span>${pName}</span> <small>(${playlists[pName].length})</small>`;
        li.onclick = () => loadCustomPlaylistContext(pName);
        customPlaylistsUl.appendChild(li);
    }
}

function loadCustomPlaylistContext(pName) {
    let playlists = JSON.parse(localStorage.getItem('userPlaylists'));
    let trackIds = playlists[pName];
    
    activeTrackList = globalTrackCatalog.filter(t => trackIds.includes(t.id));
    document.getElementById('directory-heading').innerText = `Playlist: ${pName}`;
    
    buildTrackDirectoryUI(activeTrackList, pName);
    if(activeTrackList.length > 0) {
        trackIndex = 0;
        loadTrack(trackIndex);
    } else {
        playlistUl.innerHTML = `<p class="empty-state">No tracks inside this custom list yet. Add tracks below using the '+' tag icon overlay!</p>`;
    }
}

function addTrackToPlaylist(trackId, pName) {
    let playlists = JSON.parse(localStorage.getItem('userPlaylists'));
    if(!playlists[pName].includes(trackId)) {
        playlists[pName].push(trackId);
        localStorage.setItem('userPlaylists', JSON.stringify(playlists));
        renderPlaylistSidebar();
        alert(`Track added directly to playlist array: ${pName}`);
        loadCustomPlaylistContext(pName);
    }
}

// ================= SECTION 4: PLAYBACK UI COMPILATION INTERACTION =================
function buildTrackDirectoryUI(list, currentPlaylistName = null) {
    playlistUl.innerHTML = "";
    let playlists = JSON.parse(localStorage.getItem('userPlaylists')) || {};
    
    list.forEach((track, i) => {
        const li = document.createElement('li');
        
        // Generate list options item
        let dropdownOptions = Object.keys(playlists).map(name => 
            `<option value="${name}">${name}</option>`
        ).join('');

        li.innerHTML = `
            <div class="li-info-block" onclick="selectAndPlayTrack(${i})">
                <strong>${track.title}</strong>
                <span>${track.artist}</span>
            </div>
            <div class="action-hubs">
                <select class="playlist-dropdown" onchange="if(this.value) addTrackToPlaylist(${track.id}, this.value)">
                    <option value="">+ Add to...</option>
                    ${dropdownOptions}
                </select>
                <i class="fas fa-play-circle start-icon" onclick="selectAndPlayTrack(${i})"></i>
            </div>
        `;
        playlistUl.appendChild(li);
    });
}

function selectAndPlayTrack(index) {
    trackIndex = index;
    loadTrack(trackIndex);
    playMusic();
}

function loadTrack(index) {
    if (activeTrackList.length === 0) return;
    const track = activeTrackList[index];
    title.innerText = track.title;
    artist.innerText = track.artist;
    art.style.backgroundImage = `url('${track.art}')`;
    audio.src = track.src;
    
    // Highlight list updates
    const items = playlistUl.querySelectorAll('li');
    items.forEach((item, idx) => {
        if(idx === index) item.classList.add('active-track');
        else item.classList.remove('active-track');
    });
}

// Core Media Engine Standard Actions
function togglePlay() { isPlaying ? pauseMusic() : playMusic(); }
function playMusic() { isPlaying = true; audio.play(); playPauseBtn.innerHTML = `<i class="fas fa-pause"></i>`; }
function pauseMusic() { isPlaying = false; audio.pause(); playPauseBtn.innerHTML = `<i class="fas fa-play"></i>`; }
function nextTrack() { if(activeTrackList.length === 0) return; trackIndex = (trackIndex + 1) % activeTrackList.length; loadTrack(trackIndex); playMusic(); }
function prevTrack() { if(activeTrackList.length === 0) return; trackIndex = (trackIndex - 1 + activeTrackList.length) % activeTrackList.length; loadTrack(trackIndex); playMusic(); }

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        slider.value = (audio.currentTime / audio.duration) * 100;
        currentTimeDisplay.innerText = formatTime(audio.currentTime);
        durationDisplay.innerText = formatTime(audio.duration);
    }
});
slider.addEventListener('input', () => audio.currentTime = (slider.value / 100) * audio.duration);
audio.addEventListener('ended', nextTrack);
function formatTime(s) { let m = Math.floor(s/60), sec = Math.floor(s%60); return `${m}:${sec < 10 ? '0' : ''}${sec}`; }

// ================= SECTION 5: RINGTONE SLICER TOOL MECHANIC =================
async function createRingtone() {
    if (activeTrackList.length === 0) return;
    const startTime = parseFloat(document.getElementById('start-time-input').value) || 0;
    const currentTrack = activeTrackList[trackIndex];
    alert(`Processing custom ringtone cut from second ${startTime}...`);

    try {
        const response = await fetch(currentTrack.src);
        const arrayBuffer = await response.arrayBuffer();
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        
        const sampleRate = decodedBuffer.sampleRate;
        const durationInSamples = 30 * sampleRate;
        const startSampleIndex = Math.floor(startTime * sampleRate);
        
        if (startSampleIndex + durationInSamples > decodedBuffer.length) {
            alert("Chosen start marker leaves less than 30s remaining in the song track sample pipeline.");
            return;
        }

        const newBuffer = audioCtx.createBuffer(decodedBuffer.numberOfChannels, durationInSamples, sampleRate);
        for (let i = 0; i < decodedBuffer.numberOfChannels; i++) {
            newBuffer.getChannelData(i).set(decodedBuffer.getChannelData(i).subarray(startSampleIndex, startSampleIndex + durationInSamples));
        }

        const wavBlob = bufferToWav(newBuffer);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(wavBlob);
        a.download = `${currentTrack.title.replace(/\s+/g, '_')}_Ringtone.wav`;
        a.click();
    } catch (err) {
        alert("Error executing binary raw stream chunk rendering parsing blocks.");
    }
}

// Low-level PCM binary compilation helper map conversions
function bufferToWav(b) {
    let n = b.numberOfChannels, length = b.length * n * 2 + 44, buffer = new ArrayBuffer(length), view = new DataView(buffer), pos = 0, channels = [], i, offset = 0, sample;
    function u32(d) { view.setUint32(pos, d, true); pos += 4; }
    function u16(d) { view.setUint16(pos, d, true); pos += 2; }
    u32(0x46464952); u32(length - 8); u32(0x45564157); u32(0x20746d66); u32(16); u16(1); u16(n); u32(b.sampleRate); u32(b.sampleRate * 2 * n); u16(n * 2); u16(16); u32(0x61746164); u32(length - pos - 4);
    for (i = 0; i < n; i++) channels.push(b.getChannelData(i));
    while (pos < length) {
        for (i = 0; i < n; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true); pos += 2;
        }
        offset++;
    }
    return new Blob([buffer], { type: 'audio/wav' });
}

playPauseBtn.onclick = togglePlay;
document.getElementById('btn-next').onclick = nextTrack;
document.getElementById('btn-prev').onclick = prevTrack;