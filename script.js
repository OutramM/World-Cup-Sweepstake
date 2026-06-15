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

    loadEverything();

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

   renderStandings();

   saveEverything();

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
/* ==========================================
   PART 2
   PROBABILITIES
   STANDINGS
   SAVING
========================================== */

let teamProbabilities = {};
let favouritePlayer = null;

/* ==========================================
   TEAM WIN PROBABILITIES
========================================== */

function calculateTeamProbabilities() {

    teamProbabilities = {};

    players.forEach(player => {

        teamProbabilities[player] =
            [];

        assignments[player]
            .forEach(team => {

                let probability =
                    team.winProbability;

                if (
                    probability ===
                    undefined
                ) {

                    probability =
                        estimateProbability(
                            team.rating
                        );

                }

                teamProbabilities[player]
                    .push({

                        name:
                            team.name,

                        probability:
                            probability

                    });

            });

    });

}

/* ==========================================
   ESTIMATE IF NOT PROVIDED
========================================== */

function estimateProbability(
    rating
) {

    return (
        Math.pow(
            rating,
            4
        ) /
        2000000
    );

}

/* ==========================================
   FAVOURITE
========================================== */

function calculateFavourite() {

    favouritePlayer =
        players[0];

    players.forEach(player => {

        if (

            overallProbabilities[player] >
            overallProbabilities[
                favouritePlayer
            ]

        ) {

            favouritePlayer =
                player;

        }

    });

}

/* ==========================================
   BETTER BALANCING
========================================== */

function snakeDraft(
    teamsPerPlayer
) {

    const draw =
        {};

    players.forEach(player => {

        draw[player] =
            [];

    });

    let pool =
        shuffle(
            [...activeTeams]
        );

    pool.sort(
        (
            a,
            b
        ) =>
            b.rating -
            a.rating
    );

    let direction =
        1;

    while (
        pool.length
    ) {

        let order =
            [...players];

        if (
            direction ===
            -1
        ) {

            order.reverse();

        }

        order.forEach(player => {

            if (
                !pool.length
            )
                return;

            if (
                draw[player]
                    .length >=
                teamsPerPlayer
            )
                return;

            draw[player]
                .push(
                    pool.shift()
                );

        });

        direction *=
            -1;

    }

    return draw;

}

/* ==========================================
   IMPROVED BALANCED DRAW
========================================== */

function generateBalancedDraw(
    players,
    teamsPerPlayer
) {

    let best =
        null;

    let smallest =
        Infinity;

    for (
        let i = 0;
        i < 10000;
        i++
    ) {

        const draw =
            snakeDraft(
                teamsPerPlayer
            );

        const difference =
            calculateDifference(
                draw
            );

        if (
            difference <
            smallest
        ) {

            smallest =
                difference;

            best =
                draw;

        }

        if (
            smallest <=
            3
        ) {

            break;

        }

    }

    return best;

}

/* ==========================================
   STANDINGS PAGE
========================================== */

function renderStandings() {

    const container =
        document.getElementById(
            "standingsContainer"
        );

    if (
        !container
    )
        return;

    calculateTeamProbabilities();
    calculateFavourite();

    const sorted =
        [...players]
        .sort(
            (
                a,
                b
            ) =>
                overallProbabilities[b] -
                overallProbabilities[a]
        );

    let html =
        `
        <table>

        <tr>

            <th>
            Rank
            </th>

            <th>
            Player
            </th>

            <th>
            Overall
            </th>

            <th>
            Favourite
            </th>

        </tr>
        `;

    sorted.forEach(
        (
            player,
            index
        ) => {

            let trophy =
                "";

            if (
                player ===
                favouritePlayer
            ) {

                trophy =
                    "🏆";

            }

            html +=
            `
            <tr>

                <td>
                ${index + 1}
                </td>

                <td>
                ${player}
                </td>

                <td>
                ${overallProbabilities[player]
                    .toFixed(1)}%
                </td>

                <td>
                ${trophy}
                </td>

            </tr>
            `;

        }
    );

    html +=
        `
        </table>
        `;

    container.innerHTML =
        html;

    renderProbabilityBars();

    renderTeamProbabilities();

}

/* ==========================================
   PROBABILITY BARS
========================================== */

function renderProbabilityBars() {

    const container =
        document.getElementById(
            "probabilityContainer"
        );

    if (
        !container
    )
        return;

    container.innerHTML =
        "";

    players
        .sort(
            (
                a,
                b
            ) =>
                overallProbabilities[b] -
                overallProbabilities[a]
        )
        .forEach(player => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "probabilityCard";

            card.innerHTML =
                `
                <h3>

                    ${player}

                </h3>

                <div
                    class="barOuter">

                    <div
                        class="barInner"

                        style="
                        width:
                        ${overallProbabilities[player]}%;
                        ">

                    </div>

                </div>

                <p>

                    ${overallProbabilities[player]
                        .toFixed(1)}%

                </p>
                `;

            container.appendChild(
                card
            );

        });

}

/* ==========================================
   TEAM PROBABILITIES
========================================== */

function renderTeamProbabilities() {

    const container =
        document.getElementById(
            "teamProbabilityContainer"
        );

    if (
        !container
    )
        return;

    container.innerHTML =
        "";

    players.forEach(player => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "playerProbabilityCard";

        let html =
            `
            <h2>

            ${player}

            </h2>
            `;

        const teams =
            teamProbabilities[
                player
            ];

        teams.sort(
            (
                a,
                b
            ) =>
                b.probability -
                a.probability
        );

        teams.forEach(team => {

            html +=
            `
            <div
                class="teamProbabilityRow">

                <span>

                ${team.name}

                </span>

                <span>

                ${team.probability
                    .toFixed(1)}%

                </span>

            </div>
            `;

        });

        card.innerHTML =
            html;

        container.appendChild(
            card
        );

    });

}

/* ==========================================
   SAVE
========================================== */

function saveEverything() {

    localStorage.setItem(
        "wcAssignments",
        JSON.stringify(
            assignments
        )
    );

    localStorage.setItem(
        "wcRemoved",
        JSON.stringify(
            removedTeams
        )
    );

    localStorage.setItem(
        "wcProbabilities",
        JSON.stringify(
            overallProbabilities
        )
    );

}

/* ==========================================
   LOAD
========================================== */

function loadEverything() {

    const saved =
        localStorage.getItem(
            "wcAssignments"
        );

    if (
        saved
    ) {

        assignments =
            JSON.parse(
                saved
            );

    }

    const removed =
        localStorage.getItem(
            "wcRemoved"
        );

    if (
        removed
    ) {

        removedTeams =
            JSON.parse(
                removed
            );

    }

}
