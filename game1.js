// Global settings
var damage = { a: 10, ha: 20 };

// 1. INITIALIZE GAME
function startGameState(n) {
    localStorage.clear(); 
    localStorage.setItem("n", n);
    localStorage.setItem("cursor", 1); 
    
    let healthArray = Array(n).fill(100);
    localStorage.setItem("rhp", JSON.stringify(healthArray));
    localStorage.setItem("playerMoves", JSON.stringify([])); 
    localStorage.setItem("gameHistory", JSON.stringify([])); 
    window.location.href = "ready.html";
}






/*music.pause();
localStorage.setItem("musicPlaying", "false");*/
  




let clickSound = new Audio("Button click sound.mp3");
clickSound.play();


  





function refresh() {
    window.location.href = "playerinf.html";
}

// 2. MOVE HANDLERS
function attack() { recordMove("Attack"); }
function hattack() { recordMove("Heavy Attack"); }
function defend() { recordMove("Defend"); }

// 3. CORE LOGIC (With Survivor Skipping)
function recordMove(moveType) {
    let cursor = Number(localStorage.getItem("cursor")) || 1;
    let n = Number(localStorage.getItem("n")) || 2;
    let rhp = JSON.parse(localStorage.getItem("rhp"));
    
    // Save current move
    let moves = JSON.parse(localStorage.getItem("playerMoves")) || [];
    moves.push(moveType);
    localStorage.setItem("playerMoves", JSON.stringify(moves));

    // Update global history for limits
    let history = JSON.parse(localStorage.getItem("gameHistory")) || [];
    history.push(moveType);
    localStorage.setItem("gameHistory", JSON.stringify(history));

    // Find the next survivor
    let nextPlayer = cursor + 1;
    while (nextPlayer <= n && rhp[nextPlayer - 1] <= 0) {
        // If the next player is dead, record a "Dead" move for them automatically
        moves.push("Eliminated");
        localStorage.setItem("playerMoves", JSON.stringify(moves));
        nextPlayer++;
    }

    if (nextPlayer <= n) {
        localStorage.setItem("cursor", nextPlayer);
        window.location.href = "hndovr.html"; 
    } else {
        window.location.href = "reveal.html";
    }
}

// 4. HANDOVER
function playerinf() {
    // Just a bridge to the info page
    window.location.href = "playerinf.html";
}

// 5. REVEAL & CALCULATE
function calculateResults() {
    const n = Number(localStorage.getItem("n")) || 2;
    let rhp = JSON.parse(localStorage.getItem("rhp")) || [];
    const moves = JSON.parse(localStorage.getItem("playerMoves")) || [];
    const resultsDiv = document.getElementById("results-container");
    
    let moveDescriptions = "<h3>Round Summary:</h3>";
    
    // 1. Identify who is defending this round
    let defendingPlayers = moves.map(move => move === "Defend");

    // 2. Initialize a damage buffer
    // This ensures attacks happen "at the same time" so one player 
    // doesn't die before their own attack is registered.
    let damageToTake = Array(n).fill(0);

    // 3. Process all moves to calculate total damage dealt
    for (let i = 0; i < n; i++) {
        let action = moves[i];
        
        // Skip dead players or players who were skipped
        if (rhp[i] <= 0 || action === "Eliminated") continue; 

        if (action === "Attack") {
            moveDescriptions += `<p>Player ${i+1} Attacked! (-${damage.a} HP to others)</p>`;
            for (let t = 0; t < n; t++) { 
                // Target must be someone else, not defending, and still alive
                if (t !== i && !defendingPlayers[t] && rhp[t] > 0) {
                    damageToTake[t] += damage.a; 
                }
            }
        } else if (action === "Heavy Attack") {
            moveDescriptions += `<p>Player ${i+1} used Heavy Attack! (-${damage.ha} HP to others)</p>`;
            for (let t = 0; t < n; t++) { 
                if (t !== i && !defendingPlayers[t] && rhp[t] > 0) {
                    damageToTake[t] += damage.ha; 
                }
            }
        } else if (action === "Defend") {
            moveDescriptions += `<p>Player ${i+1} Defended! (Immune this round)</p>`;
        }
    }

    // 4. Apply all damage at once
    for (let i = 0; i < n; i++) {
        rhp[i] -= damageToTake[i];
        if (rhp[i] < 0) rhp[i] = 0; // Clamp health at 0
    }

    // Save the updated health back to storage
    localStorage.setItem("rhp", JSON.stringify(rhp));

    // 5. Determine the Game State (Winner or Tie)
    let alive = rhp.map((hp, i) => ({id: i+1, hp})).filter(p => p.hp > 0);
    let status = "";
    let over = false;

    if (alive.length === 1) {
        status = `<h2 style="color: lime; text-shadow: 0 0 10px green;">🏆 WINNER: PLAYER ${alive[0].id}!</h2>`;
        over = true;
    } else if (alive.length === 0) {
        // Fix for the "Simultaneous Fall" bug
        status = `<h2 style="color: #ff4500; text-shadow: 0 0 10px red;">💥It's a Tie!</h2>`;
        over = true;
    }

    // 6. Update the UI
    resultsDiv.innerHTML = moveDescriptions + "<h3>Final Health:</h3>" + 
        rhp.map((hp, i) => `Player ${i+1}: ${hp} HP ${hp === 0 ? "<b>(ELIMINATED)</b>" : ""}`).join("<br>") + status;

    // Change the button if the game ended
    if (over) {
        const btn = document.getElementById("continue-btn");
        if (btn) {
            btn.textContent = "Restart Game";
            btn.onclick = () => { 
                localStorage.clear(); 
                window.location.href = "index.html"; 
            };
        }
    }
}

// 6. UI HELPERS
function updateHealthUI() {
    let rhp = JSON.parse(localStorage.getItem("rhp")) || [];
    let n = Number(localStorage.getItem("n")) || 2;

    for (let i = 1; i <= 4; i++) {
        let hpElement = document.getElementById('xx' + i);
        if (hpElement) {
            if (i <= n) {
                hpElement.textContent = `Player ${i} Health: ${rhp[i-1]} HP`;
                hpElement.style.display = "block";
                if(rhp[i-1] <= 0) hpElement.style.color = "gray";
            } else {
                hpElement.style.display = "none";
            }
        }
    }
}

function nextRound() {
    let rhp = JSON.parse(localStorage.getItem("rhp"));
    localStorage.setItem("playerMoves", JSON.stringify([]));
    
    // Find the first player who is still alive to start the next round
    let firstSurvivor = rhp.findIndex(hp => hp > 0) + 1;
    localStorage.setItem("cursor", firstSurvivor);
    window.location.href = "playerinf.html";
}