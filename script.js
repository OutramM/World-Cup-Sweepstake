/* ==========================================
   WORLD CUP SWEEPSTAKE 2026
   PART 1
========================================== */

let players = [];
let assignments = {};
let removedTeams = [];

let playerStrengths = {};
let overallProbabilities = {};

document.addEventListener(
    "DOMContentLoaded",
    initialise
);

/* ==========================================
   STARTUP
========================================== */

function initialise() {

    setupNavigation();
    setupButtons();

}

/* ==========================================
   NAVIGATION
========================================== */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".navButton"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.page
                );

            }
        );

    });

}

function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "activePage"
            );

        });

    document
        .querySelectorAll(
            ".navButton"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });

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

    document
        .getElementById(
            "startButton"
        )
        ?.addEventListener(
            "click",
            generateDraw
        );

    document
        .getElementById(
            "generateButton"
        )
        ?.addEventListener(
            "click",
            generateDraw
        );

    document
        .getElementById(
            "randomNamesButton"
        )
        ?.addEventListener(
            "click",
            fillDemoPlayers
        );

}

/* ==========================================
   DEMO PLAYERS
========================================== */

function fillDemoPlayers() {

    document
        .getElementById(
            "playersInput"
        )
        .value =
`
Max
Tom
Will
Miller
Olly
Matty
`;

}

/* ==========================================
   GET PLAYERS
========================================== */

function getPlayers() {

    return document
        .getElementById(
            "playersInput"
        )
        .value
        .split("\n")
        .map(
            x => x.trim()
        )
        .filter(
            x => x !== ""
        );

}

/* ==========================================
   MAIN DRAW
========================================== */

function generateDraw() {

    if (
        typeof teams ===
        "undefined"
    ) {

        alert(
            "teams.js failed to load."
        );

        return;

    }

    players =
        getPlayers();

    if (
        players.length < 2
    ) {

        alert(
            "Please enter at least 2 players."
        );

        return;

    }

    const teamsPerPlayer =
        Number(
            document
                .getElementById(
                    "teamsPerPlayer"
                )
                .value
        );

    const requiredTeams =
        players.length *
        teamsPerPlayer;

    prepareTeams(
        requiredTeams
    );

    assignments =
        generateBalancedDraw(
            players,
            teamsPerPlayer
        );

    calculateStrengths();

    calculateProbabilities();

    renderDraw();

    showPage(
        "draw"
    );

}

/* ==========================================
   REMOVE WEAKEST TEAMS
========================================== */

function prepareTeams(
    requiredTeams
) {

    const sorted =
        [...teams]
        .sort(
            (
                a,
                b
            ) =>
                b.rating -
                a.rating
        );

    if (
        requiredTeams >=
        sorted.length
    ) {

        removedTeams =
            [];

        activeTeams =
            sorted;

        return;

    }

    activeTeams =
        sorted.slice(
            0,
            requiredTeams
        );

    removedTeams =
        sorted.slice(
            requiredTeams
        );

}

/* ==========================================
   BALANCED DRAW
========================================== */

function generateBalancedDraw(
    players,
    teamsPerPlayer
) {

    let bestDraw = null;
    let bestDifference =
        Infinity;

    for (
        let i = 0;
        i < 5000;
        i++
    ) {

        const draw =
            singleDraw(
                players,
                teamsPerPlayer
            );

        const difference =
            calculateDifference(
                draw
            );

        if (
            difference <
            bestDifference
        ) {

            bestDifference =
                difference;

            bestDraw =
                draw;

        }

    }

    return bestDraw;

}

/* ==========================================
   SINGLE DRAW
========================================== */

function singleDraw(
    players,
    teamsPerPlayer
) {

    const draw =
        {};

    players.forEach(
        player => {

            draw[player] =
                [];

        }
    );

    let available =
        shuffle(
            [...activeTeams]
        );

    const pot1 =
        available.filter(
            t =>
                t.pot === 1
        );

    if (
        pot1.length >=
        players.length
    ) {

        const shuffled =
            shuffle(
                pot1
            );

        players.forEach(
            (
                player,
                i
            ) => {

                draw[player]
                    .push(
                        shuffled[i]
                    );

                available =
                    available.filter(
                        team =>
                            team.name !==
                            shuffled[i]
                            .name
                    );

            }
        );

    }

    let index = 0;

    while (
        available.length
    ) {

        const player =
            players[
                index
            ];

        if (
            draw[player]
                .length <
            teamsPerPlayer
        ) {

            draw[player]
                .push(
                    available.pop()
                );

        }

        index =
            (
                index +
                1
            ) %
            players.length;

    }

    return draw;

}

/* ==========================================
   STRENGTHS
========================================== */

function calculateStrengths() {

    playerStrengths =
        {};

    players.forEach(
        player => {

            playerStrengths[
                player
            ] =
                assignments[
                    player
                ]
                .reduce(
                    (
                        total,
                        team
                    ) =>
                        total +
                        team.rating,
                    0
                );

        }
    );

}

/* ==========================================
   BALANCE DIFFERENCE
========================================== */

function calculateDifference(
    draw
) {

    const values =
        Object.values(
            draw
        )
        .map(
            teams =>
                teams.reduce(
                    (
                        total,
                        team
                    ) =>
                        total +
                        team.rating,
                    0
                )
        );

    return (
        Math.max(
            ...values
        ) -
        Math.min(
            ...values
        )
    );

}

/* ==========================================
   OVERALL WIN %
========================================== */

function calculateProbabilities() {

    overallProbabilities =
        {};

    const totalStrength =
        Object.values(
            playerStrengths
        )
        .reduce(
            (
                a,
                b
            ) =>
                a + b,
            0
        );

    players.forEach(
        player => {

            overallProbabilities[
                player
            ] =
                (
                    playerStrengths[
                        player
                    ] /
                    totalStrength
                ) *
                100;

        }
    );

}

/* ==========================================
   DRAW PAGE
========================================== */

function renderDraw() {

    const container =
        document.getElementById(
            "drawCards"
        );

    container.innerHTML =
        "";

    players.forEach(
        player => {

            assignments[
                player
            ]
            .sort(
                (
                    a,
                    b
                ) =>
                    b.rating -
                    a.rating
            );

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "playerCard";

            let html =
                `
                <h2>
                    ${player}
                </h2>

                <p>
                    Overall Chance:

                    ${overallProbabilities[player]
                        .toFixed(1)}%
                </p>
                `;

            assignments[
                player
            ]
            .forEach(
                team => {

                    html +=
                    `
                    <div class="teamRow">

                        <img
                        src="https://flagcdn.com/w40/${team.code}.png">

                        <span>

                            ${team.name}

                        </span>

                        <span>

                            ${team.rating}

                        </span>

                    </div>
                    `;

                }
            );

            card.innerHTML =
                html;

            container.appendChild(
                card
            );

        }
    );

    renderRemovedTeams();

}

/* ==========================================
   REMOVED TEAMS
========================================== */

function renderRemovedTeams() {

    const container =
        document.getElementById(
            "removedTeams"
        );

    if (
        !container
    )
        return;

    container.innerHTML =
        "";

    removedTeams.forEach(
        team => {

            container.innerHTML +=
            `
            <div class="removedTeam">

                <img
                src="https://flagcdn.com/w40/${team.code}.png">

                ${team.name}

            </div>
            `;

        }
    );

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
                (
                    i + 1
                )
            );

        [
            copy[i],
            copy[j]
        ] =
        [
            copy[j],
            copy[i]
        ];

    }

    return copy;

}
