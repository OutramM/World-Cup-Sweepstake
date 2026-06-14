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
