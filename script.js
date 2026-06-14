/* ==========================================
   GLOBAL VARIABLES
========================================== */

let currentAssignments = {};
let currentPlayers = [];
let currentFixtures = [];

const MAX_STRENGTH_DIFFERENCE = 10;

/* ==========================================
   STARTUP
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    initialiseApp
);

function initialiseApp() {

    setupNavigation();
    setupButtons();
    loadSavedDraw();
    createParticles();

}

/* ==========================================
   NAVIGATION
========================================== */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(".navButton");

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                showPage(page);

            }
        );

    });

}

function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page =>
            page.classList.remove(
                "activePage"
            )
        );

    document
        .querySelectorAll(".navButton")
        .forEach(button =>
            button.classList.remove(
                "active"
            )
        );

    const page =
        document.getElementById(
            pageName + "Page"
        );

    if (page) {

        page.classList.add(
            "activePage"
        );

    }

    document
        .querySelector(
            `[data-page="${pageName}"]`
        )
        ?.classList.add(
            "active"
        );
}

/* ==========================================
   BUTTONS
========================================== */

function setupButtons() {

    const startButton =
        document.getElementById(
            "startButton"
        );

    if (startButton) {

        startButton.onclick =
            () => {

                showPage("draw");

            };

    }

    const generateButton =
        document.getElementById(
            "generateButton"
        );

    if (generateButton) {

        generateButton.onclick =
            generateDraw;

    }

    const randomButton =
        document.getElementById(
            "randomNamesButton"
        );

    if (randomButton) {

        randomButton.onclick =
            randomDemo;

    }

}

/* ==========================================
   RANDOM DEMO
========================================== */

function randomDemo() {

    const demo = [

        "Max",
        "Tom",
        "Will",
        "Matty",
        "Olly",
        "Josh"

    ];

    document.getElementById(
        "playersInput"
    ).value =
        demo.join("\n");

}

/* ==========================================
   GENERATE DRAW
========================================== */

function generateDraw() {

    showLoading(true);

    setTimeout(() => {

        const players =
            getPlayers();

        if (
            players.length < 2
        ) {

            showToast(
                "Add at least 2 players."
            );

            showLoading(false);

            return;
        }

        currentPlayers =
            players;

        const assignments =
            generateBalancedDraw(
                players
            );

        currentAssignments =
            assignments;

        renderDraw(
            assignments
        );

        saveDraw();

        showPage("draw");

        showToast(
            "Draw generated!"
        );

        showLoading(false);

    }, 800);

}

/* ==========================================
   GET PLAYERS
========================================== */

function getPlayers() {

    const text =
        document
            .getElementById(
                "playersInput"
            )
            .value;

    return text
        .split("\n")
        .map(
            x => x.trim()
        )
        .filter(
            x => x !== ""
        );
}

/* ==========================================
   FAIR DRAW
========================================== */

function generateBalancedDraw(
    players
) {

    const teamsPerPlayer =
        Number(
            document
                .getElementById(
                    "teamsPerPlayer"
                )
                .value
        );

    let bestDraw = null;
    let bestDifference = Infinity;

    const simulations =
        Number(
            document
                .getElementById(
                    "simulationCount"
                )
                .value
        );

    for (
        let i = 0;
        i < simulations;
        i++
    ) {

        const draw =
            makeSingleDraw(
                players,
                teamsPerPlayer
            );

        const diff =
            calculateDifference(
                draw
            );

        if (
            diff <
            bestDifference
        ) {

            bestDifference =
                diff;

            bestDraw =
                draw;

        }

        if (
            diff <=
            MAX_STRENGTH_DIFFERENCE
        ) {
            break;
        }

    }

    return bestDraw;
}

/* ==========================================
   SINGLE DRAW
========================================== */

function makeSingleDraw(
    players,
    teamsPerPlayer
) {

    const assignments = {};

    players.forEach(
        player => {

            assignments[
                player
            ] = [];

        }
    );

    const pot1 =
        shuffle(
            teams.filter(
                t =>
                    t.pot === 1
            )
        );

    players.forEach(
        (
            player,
            index
        ) => {

            assignments[
                player
            ].push(
                pot1[
                    index %
                    pot1.length
                ]
            );

        }
    );

    let remaining =
        shuffle(
            teams.filter(
                t =>
                    t.pot !== 1
            )
        );

    let playerIndex = 0;

    remaining.forEach(
        team => {

            let loops = 0;

            while (

                assignments[
                    players[
                        playerIndex
                    ]
                ].length >=
                    teamsPerPlayer

                && loops < 200

            ) {

                playerIndex =
                    (
                        playerIndex +
                        1
                    ) %
                    players.length;

                loops++;

            }

            if (
                assignments[
                    players[
                        playerIndex
                    ]
                ].length <
                teamsPerPlayer
            ) {

                assignments[
                    players[
                        playerIndex
                    ]
                ].push(
                    team
                );

            }

            playerIndex =
                (
                    playerIndex +
                    1
                ) %
                players.length;

        }
    );

    return assignments;
}

/* ==========================================
   STRENGTH CALCULATIONS
========================================== */

function calculateDifference(
    assignments
) {

    const totals =
        Object.values(
            assignments
        ).map(
            calculateStrength
        );

    const max =
        Math.max(
            ...totals
        );

    const min =
        Math.min(
            ...totals
        );

    return max - min;
}

function calculateStrength(
    teamsList
) {

    let total = 0;

    teamsList.forEach(
        team => {

            total +=
                team.rating;

        }
    );

    return total;
}

/* ==========================================
   SHUFFLE
========================================== */

function shuffle(
    array
) {

    const copy =
        [...array];

    for (
        let i =
            copy.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            copy[i],
            copy[j]
        ] = [
            copy[j],
            copy[i]
        ];
    }

    return copy;
}

/* ==========================================
   DRAW CARDS
========================================== */

function renderDraw(
    assignments
) {

    const container =
        document.getElementById(
            "drawCards"
        );

    if (!container)
        return;

    container.innerHTML =
        "";

    Object.keys(
        assignments
    ).forEach(
        player => {

            const teamsList =
                assignments[
                    player
                ];

            const strength =
                calculateStrength(
                    teamsList
                );

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "card";

            card.innerHTML =
                `
                <h2>
                    👤 ${player}
                </h2>

                <h3>
                    ⭐ Strength:
                    ${strength}
                </h3>
                `;

            teamsList.forEach(
                team => {

                    const row =
                        document.createElement(
                            "div"
                        );

                    row.className =
                        "team";

                    row.innerHTML =
                        `
                        <div class="teamLeft">

                            <img
                                class="flag"
                                src="https://flagcdn.com/w40/${team.code}.png"
                            >

                            <span>
                                ${team.name}
                            </span>

                        </div>

                        <span>
                            ${team.rating}
                        </span>
                        `;

                    card.appendChild(
                        row
                    );

                }
            );

            card.onclick =
                () =>
                    openPlayerModal(
                        player
                    );

            container.appendChild(
                card
            );

        }
    );

}

/* ==========================================
   MODAL
========================================== */

function openPlayerModal(
    player
) {

    const modal =
        document.getElementById(
            "teamModal"
        );

    const content =
        document.getElementById(
            "modalContent"
        );

    const teamsList =
        currentAssignments[
            player
        ];

    let html =
        `
        <h2>
            ${player}
        </h2>

        <br>
        `;

    teamsList.forEach(
        team => {

            html +=
                `
                <p>
                🇺🇳
                ${team.name}
                ⭐ ${team.rating}
                </p>
                `;

        }
    );

    content.innerHTML =
        html;

    modal.style.display =
        "flex";

}

/* ==========================================
   CLOSE MODAL
========================================== */

document.addEventListener(
    "click",
    function (e) {

        if (
            e.target.id ===
            "closeModal"
        ) {

            document.getElementById(
                "teamModal"
            ).style.display =
                "none";

        }

        if (
            e.target.id ===
            "teamModal"
        ) {

            document.getElementById(
                "teamModal"
            ).style.display =
                "none";

        }

    }
);

/* ==========================================
   LOADING
========================================== */

function showLoading(
    show
) {

    const loading =
        document.getElementById(
            "loadingScreen"
        );

    if (!loading)
        return;

    loading.style.display =
        show
            ? "flex"
            : "none";
}

/* ==========================================
   TOAST
========================================== */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast)
        return;

    toast.innerText =
        message;

    toast.style.display =
        "block";

    setTimeout(
        () => {

            toast.style.display =
                "none";

        },
        2500
    );
}
/* ==========================================
   SAVE / LOAD
========================================== */

function saveDraw() {

    const data = {

        assignments:
            currentAssignments,

        players:
            currentPlayers

    };

    localStorage.setItem(
        "worldCupSweepstake",
        JSON.stringify(data)
    );

}

function loadSavedDraw() {

    const data =
        localStorage.getItem(
            "worldCupSweepstake"
        );

    if (!data)
        return;

    try {

        const parsed =
            JSON.parse(data);

        currentAssignments =
            parsed.assignments || {};

        currentPlayers =
            parsed.players || [];

        if (
            Object.keys(
                currentAssignments
            ).length > 0
        ) {

            renderDraw(
                currentAssignments
            );

            generateStandings();

            generateFixtures();

        }

    }

    catch {

        console.log(
            "No save found."
        );

    }

}

/* ==========================================
   GENERATE FIXTURES
========================================== */

function generateFixtures() {

    const container =
        document.getElementById(
            "fixturesContainer"
        );

    if (!container)
        return;

    container.innerHTML =
        "";

    currentFixtures =
        [];

    const players =
        currentPlayers;

    for (
        let i = 0;
        i < players.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < players.length;
            j++
        ) {

            currentFixtures.push({

                home:
                    players[i],

                away:
                    players[j],

                homeGoals:
                    "",

                awayGoals:
                    ""

            });

        }

    }

    currentFixtures.forEach(
        fixture => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "fixtureCard";

            card.innerHTML =
                `
                <h3>
                ${fixture.home}
                vs
                ${fixture.away}
                </h3>

                <br>

                <input
                    type="number"
                    min="0"
                    class="scoreInput"
                    placeholder="Home Goals"
                >

                <br><br>

                <input
                    type="number"
                    min="0"
                    class="scoreInput"
                    placeholder="Away Goals"
                >
                `;

            container.appendChild(
                card
            );

        }
    );

}

/* ==========================================
   STANDINGS
========================================== */

function generateStandings() {

    const container =
        document.getElementById(
            "standingsContainer"
        );

    if (!container)
        return;

    let table =
        `
        <table>

        <tr>

        <th>Player</th>
        <th>Strength</th>

        </tr>
        `;

    currentPlayers.forEach(
        player => {

            const strength =
                calculateStrength(
                    currentAssignments[
                        player
                    ]
                );

            table +=
                `
                <tr>

                <td>
                ${player}
                </td>

                <td>
                ${strength}
                </td>

                </tr>
                `;

        }
    );

    table +=
        `
        </table>
        `;

    container.innerHTML =
        table;

}

/* ==========================================
   BETTER BALANCING CHECK
========================================== */

function evaluateBalance() {

    const strengths =
        [];

    currentPlayers.forEach(
        player => {

            strengths.push(
                calculateStrength(
                    currentAssignments[
                        player
                    ]
                )
            );

        }
    );

    const highest =
        Math.max(
            ...strengths
        );

    const lowest =
        Math.min(
            ...strengths
        );

    return {

        highest,
        lowest,
        difference:
            highest -
            lowest

    };

}

/* ==========================================
   WIN PROBABILITY
========================================== */

function getWinningChance(
    player
) {

    const strengths =
        currentPlayers.map(
            p =>
                calculateStrength(
                    currentAssignments[
                        p
                    ]
                )
        );

    const total =
        strengths.reduce(
            (
                a,
                b
            ) =>
                a + b,
            0
        );

    const strength =
        calculateStrength(
            currentAssignments[
                player
            ]
        );

    return (
        (
            strength /
            total
        ) *
        100
    ).toFixed(1);

}

/* ==========================================
   WORLD MAP
========================================== */

function renderWorldMap() {

    const map =
        document.getElementById(
            "worldMap"
        );

    if (!map)
        return;

    map.onclick =
        function () {

            showToast(
                "Interactive map coming soon!"
            );

        };

}

/* ==========================================
   CONFETTI
========================================== */

function launchConfetti() {

    for (
        let i = 0;
        i < 120;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );

        piece.style.position =
            "fixed";

        piece.style.width =
            "10px";

        piece.style.height =
            "10px";

        piece.style.left =
            Math.random() *
                window.innerWidth +
            "px";

        piece.style.top =
            "-20px";

        piece.style.background =
            `hsl(
            ${
                Math.random() *
                360
            },
            100%,
            50%
            )`;

        piece.style.zIndex =
            99999;

        piece.style.borderRadius =
            "50%";

        document.body.appendChild(
            piece
        );

        piece.animate(

            [

                {
                    transform:
                        "translateY(0px)"
                },

                {
                    transform:
                        `translateY(
                        ${
                            window.innerHeight +
                            100
                        }px
                        )
                        rotate(
                        ${
                            Math.random() *
                            1080
                        }deg
                        )`
                }

            ],

            {

                duration:
                    3000 +
                    Math.random() *
                        2000,

                easing:
                    "linear"

            }

        );

        setTimeout(
            () => {

                piece.remove();

            },
            5000
        );

    }

}

/* ==========================================
   PARTICLES
========================================== */

function createParticles() {

    const container =
        document.getElementById(
            "particles"
        );

    if (!container)
        return;

    for (
        let i = 0;
        i < 40;
        i++
    ) {

        const p =
            document.createElement(
                "div"
            );

        p.style.position =
            "absolute";

        p.style.width =
            "4px";

        p.style.height =
            "4px";

        p.style.borderRadius =
            "50%";

        p.style.background =
            "rgba(255,255,255,0.25)";

        p.style.left =
            Math.random() *
                100 +
            "%";

        p.style.top =
            Math.random() *
                100 +
            "%";

        p.animate(

            [

                {
                    transform:
                        "translateY(0px)"
                },

                {
                    transform:
                        "translateY(-80px)"
                }

            ],

            {

                duration:
                    3000 +
                    Math.random() *
                        5000,

                direction:
                    "alternate",

                iterations:
                    Infinity

            }

        );

        container.appendChild(
            p
        );

    }

}

/* ==========================================
   GENERATE AFTER DRAW
========================================== */

const oldGenerateDraw =
    generateDraw;

generateDraw =
    function () {

        oldGenerateDraw();

        setTimeout(
            () => {

                generateFixtures();

                generateStandings();

                renderWorldMap();

                const balance =
                    evaluateBalance();

                if (
                    balance.difference <=
                    8
                ) {

                    launchConfetti();

                    showToast(
                        "Excellent balance! 🎉"
                    );

                }

            },
            1000
        );

    };
