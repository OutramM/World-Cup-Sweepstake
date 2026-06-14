/* =====================================
   WORLD CUP SWEEPSTAKE 2026
   SCRIPT.JS PART 1
===================================== */

let assignments = {};
let players = [];
let playerStrengths = {};
let winningProbabilities = {};
let fixtures = [];

document.addEventListener(
    "DOMContentLoaded",
    initialise
);

/* =====================================
   INITIALISE
===================================== */

function initialise() {

    setupNavigation();
    setupButtons();
    createParticles();
    loadSave();
    loadFixtures();
    loadBracket();

}

/* =====================================
   NAVIGATION
===================================== */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".navButton"
        );

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
        .forEach(page => {

            page.classList.remove(
                "activePage"
            );

        });

    document
        .querySelectorAll(".navButton")
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

/* =====================================
   BUTTONS
===================================== */

function setupButtons() {

    const start =
        document.getElementById(
            "startButton"
        );

    if (start) {

        start.onclick =
            generateDraw;

    }

    const generate =
        document.getElementById(
            "generateButton"
        );

    if (generate) {

        generate.onclick =
            generateDraw;

    }

    const random =
        document.getElementById(
            "randomNamesButton"
        );

    if (random) {

        random.onclick =
            fillDemoPlayers;

    }

}

/* =====================================
   DEMO PLAYERS
===================================== */

function fillDemoPlayers() {

    document
        .getElementById(
            "playersInput"
        )
        .value =
`
Max
Will
Tom
Miller
Matty
Olly
`;

}

/* =====================================
   GET PLAYERS
===================================== */

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

/* =====================================
   GENERATE DRAW
===================================== */

function generateDraw() {

    if (
        typeof teams ===
        "undefined"
    ) {

        alert(
            "teams.js has not loaded."
        );

        return;
    }

    players =
        getPlayers();

    const teamsPerPlayer =
        Number(
            document
                .getElementById(
                    "teamsPerPlayer"
                )
                .value
        );

    const totalSlots =
        players.length *
        teamsPerPlayer;

    if (
        totalSlots !==
        teams.length
    ) {

        showToast(
            `Need exactly ${teams.length}
            team slots.

            Currently:
            ${players.length}
            ×
            ${teamsPerPlayer}
            =
            ${totalSlots}`
        );

        return;
    }

    showLoading(true);

    setTimeout(() => {

        assignments =
            generateBalancedDraw(
                players,
                teamsPerPlayer
            );

        calculateProbabilities();

        renderCards();

        save();

        postDraw();

        showPage("draw");

        showLoading(false);

        launchConfetti();

    }, 800);

}

/* =====================================
   BALANCED DRAW
===================================== */

function generateBalancedDraw(
    players,
    teamsPerPlayer
) {

    let bestDraw = null;
    let bestDifference =
        Infinity;

    for (
        let simulation = 0;
        simulation < 10000;
        simulation++
    ) {

        const draw =
            makeDraw(
                players,
                teamsPerPlayer
            );

        const diff =
            getDifference(
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
            diff <= 4
        ) {
            break;
        }

    }

    return bestDraw;

}

/* =====================================
   SINGLE DRAW
===================================== */

function makeDraw(
    players,
    teamsPerPlayer
) {

    const result = {};

    players.forEach(player => {

        result[player] = [];

    });

    const pot1 =
        shuffle(
            teams.filter(
                t => t.pot === 1
            )
        );

    players.forEach(
        (player, i) => {

            result[player]
                .push(
                    pot1[i]
                );

        }
    );

    const remaining =
        shuffle(
            teams.filter(
                t => t.pot !== 1
            )
        );

    let playerIndex = 0;

    while (
        remaining.length
    ) {

        const player =
            players[
                playerIndex
            ];

        if (
            result[player]
                .length <
            teamsPerPlayer
        ) {

            result[player]
                .push(
                    remaining.pop()
                );

        }

        playerIndex =
            (
                playerIndex +
                1
            ) %
            players.length;

    }

    return result;

}

/* =====================================
   STRENGTHS
===================================== */

function getStrength(
    teamList
) {

    return teamList
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

function getDifference(
    draw
) {

    const strengths =
        Object.values(
            draw
        ).map(
            getStrength
        );

    const max =
        Math.max(
            ...strengths
        );

    const min =
        Math.min(
            ...strengths
        );

    return max - min;

}

/* =====================================
   WIN PROBABILITIES
===================================== */

function calculateProbabilities() {

    playerStrengths = {};
    winningProbabilities = {};

    let total = 0;

    players.forEach(
        player => {

            const strength =
                getStrength(
                    assignments[
                        player
                    ]
                );

            playerStrengths[
                player
            ] =
                strength;

            total +=
                strength;

        }
    );

    players.forEach(
        player => {

            const probability =
                (
                    playerStrengths[
                        player
                    ] /
                    total
                ) *
                100;

            winningProbabilities[
                player
            ] =
                probability.toFixed(
                    1
                );

        }
    );

}

/* =====================================
   SHUFFLE
===================================== */

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

/* =====================================
   DRAW CARDS
===================================== */

function renderCards() {

    const container =
        document.getElementById(
            "drawCards"
        );

    container.innerHTML =
        "";

    players.forEach(
        player => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "card";

            let html =
                `
                <h2>
                👤 ${player}
                </h2>

                <h3>
                ⭐ ${playerStrengths[player]}
                </h3>

                <p>
                🏆 Win Chance:
                ${winningProbabilities[player]}%
                </p>

                <br>
                `;

            assignments[
                player
            ]
            .forEach(
                team => {

                    html +=
                    `
                    <div class="team">

                        <div class="teamLeft">

                            <img
                            class="flag"
                            src="https://flagcdn.com/w40/${team.code}.png">

                            <span>
                            ${team.name}
                            </span>

                        </div>

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

}

/* =====================================
   SAVE
===================================== */

function save() {

    localStorage.setItem(
        "wcAssignments",
        JSON.stringify(
            assignments
        )
    );

}

function loadSave() {

    const data =
        localStorage.getItem(
            "wcAssignments"
        );

    if (
        !data
    )
        return;

    assignments =
        JSON.parse(
            data
        );

}

/* =====================================
   TOAST
===================================== */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (
        !toast
    )
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
        4000
    );

}
/* =====================================
   FIXTURES
===================================== */

function generateFixtures() {

    const container =
        document.getElementById(
            "fixturesContainer"
        );

    if (!container)
        return;

    container.innerHTML = "";

    fixtures = [];

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

            fixtures.push({

                home:
                    players[i],

                away:
                    players[j],

                homeGoals: "",
                awayGoals: ""

            });

        }
    }

    renderFixtures();

}

/* =====================================
   RENDER FIXTURES
===================================== */

function renderFixtures() {

    const container =
        document.getElementById(
            "fixturesContainer"
        );

    if (!container)
        return;

    container.innerHTML = "";

    fixtures.forEach(
        (
            fixture,
            index
        ) => {

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

                <div class="scoreBox">

                    <input
                    type="number"
                    min="0"
                    value="${fixture.homeGoals}"
                    onchange="updateFixture(${index},'home',this.value)"
                    >

                    <span>-</span>

                    <input
                    type="number"
                    min="0"
                    value="${fixture.awayGoals}"
                    onchange="updateFixture(${index},'away',this.value)"
                    >

                </div>
                `;

            container.appendChild(
                card
            );

        }
    );

}

/* =====================================
   UPDATE FIXTURE
===================================== */

function updateFixture(
    index,
    side,
    value
) {

    if (
        side === "home"
    ) {

        fixtures[
            index
        ].homeGoals =
            value;

    }

    else {

        fixtures[
            index
        ].awayGoals =
            value;

    }

    saveFixtures();

}

/* =====================================
   STANDINGS
===================================== */

function generateStandings() {

    const container =
        document.getElementById(
            "standingsContainer"
        );

    if (!container)
        return;

    container.innerHTML = "";

    const sorted =
        [...players]
        .sort(
            (
                a,
                b
            ) =>
                playerStrengths[b] -
                playerStrengths[a]
        );

    let html =
        `
        <table>

        <tr>

        <th>Rank</th>
        <th>Player</th>
        <th>Strength</th>
        <th>Win %</th>

        </tr>
        `;

    sorted.forEach(
        (
            player,
            i
        ) => {

            html +=
            `
            <tr>

                <td>
                    ${i + 1}
                </td>

                <td>
                    ${player}
                </td>

                <td>
                    ${playerStrengths[player]}
                </td>

                <td>
                    ${winningProbabilities[player]}%
                </td>

            </tr>
            `;

        }
    );

    html +=
        "</table>";

    container.innerHTML =
        html;

}

/* =====================================
   EA FC PROBABILITY BARS
===================================== */

function renderProbabilityBars() {

    const container =
        document.getElementById(
            "probabilityContainer"
        );

    if (!container)
        return;

    container.innerHTML =
        "";

    players.forEach(
        player => {

            const bar =
                document.createElement(
                    "div"
                );

            bar.className =
                "probabilityBar";

            bar.innerHTML =
                `
                <h3>
                    ${player}
                </h3>

                <div class="barOuter">

                    <div
                    class="barInner"
                    style="
                    width:
                    ${winningProbabilities[player]}%;
                    ">
                    </div>

                </div>

                <p>
                    ${winningProbabilities[player]}%
                </p>
                `;

            container.appendChild(
                bar
            );

        }
    );

}

/* =====================================
   KNOCKOUT BRACKET
===================================== */

function generateBracket() {

    const container =
        document.getElementById(
            "bracketContainer"
        );

    if (!container)
        return;

    container.innerHTML =
        "";

    const sorted =
        [...players]
        .sort(
            (
                a,
                b
            ) =>
                playerStrengths[b] -
                playerStrengths[a]
        );

    let html =
        `
        <div class="round">

        <h2>
        Round of ${players.length}
        </h2>
        `;

    for (
        let i = 0;
        i < sorted.length;
        i += 2
    ) {

        const player1 =
            sorted[i];

        const player2 =
            sorted[i + 1];

        if (!player2)
            break;

        html +=
        `
        <div class="bracketMatch">

            <div>
                ${player1}
            </div>

            <div>
                ${player2}
            </div>

        </div>
        `;

    }

    html +=
        "</div>";

    container.innerHTML =
        html;

}

/* =====================================
   LOADING SCREEN
===================================== */

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

/* =====================================
   CONFETTI
===================================== */

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

        piece.style.left =
            Math.random() *
            window.innerWidth +
            "px";

        piece.style.top =
            "-20px";

        piece.style.width =
            "10px";

        piece.style.height =
            "10px";

        piece.style.borderRadius =
            "50%";

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

        document.body
            .appendChild(
                piece
            );

        piece.animate(
            [

                {
                    transform:
                        "translateY(0)"
                },

                {
                    transform:
                        `translateY(
                        ${
                            window.innerHeight +
                            100
                        }px)
                        rotate(
                        ${
                            Math.random() *
                            1080
                        }deg)`
                }

            ],
            {

                duration:
                    3000 +
                    Math.random() *
                    3000,

                easing:
                    "linear"

            }
        );

        setTimeout(
            () =>
                piece.remove(),
            6000
        );

    }

}

/* =====================================
   BACKGROUND PARTICLES
===================================== */

function createParticles() {

    const particles =
        document.getElementById(
            "particles"
        );

    if (!particles)
        return;

    for (
        let i = 0;
        i < 60;
        i++
    ) {

        const p =
            document.createElement(
                "div"
            );

        p.className =
            "particle";

        p.style.left =
            Math.random() *
            100 +
            "%";

        p.style.top =
            Math.random() *
            100 +
            "%";

        p.style.animationDuration =
            (
                6 +
                Math.random() *
                10
            ) +
            "s";

        particles.appendChild(
            p
        );

    }

}

/* =====================================
   SAVE FIXTURES
===================================== */

function saveFixtures() {

    localStorage.setItem(
        "wcFixtures",
        JSON.stringify(
            fixtures
        )
    );

}

function loadFixtures() {

    const save =
        localStorage.getItem(
            "wcFixtures"
        );

    if (!save)
        return;

    fixtures =
        JSON.parse(
            save
        );

    renderFixtures();

}

/* =====================================
   AFTER DRAW
===================================== */

function postDraw() {

    generateStandings();

    renderProbabilityBars();

    generateFixtures();

    createKnockoutTree();

}
/* =====================================
   EA FC KNOCKOUT BRACKET
===================================== */

let bracketRounds = [];

/* =====================================
   CREATE BRACKET
===================================== */

function createKnockoutTree() {

    const container =
        document.getElementById(
            "bracketContainer"
        );

    if (!container)
        return;

    container.innerHTML = "";

    bracketRounds = [];

    let seeds =
        [...players]
        .sort(
            (
                a,
                b
            ) =>
                playerStrengths[b] -
                playerStrengths[a]
        );

    let round =
        [];

    for (
        let i = 0;
        i < seeds.length;
        i += 2
    ) {

        round.push({

            player1:
                seeds[i],

            player2:
                seeds[i + 1],

            score1: "",
            score2: "",

            winner: null

        });

    }

    bracketRounds.push(
        round
    );

    renderBracket();

}

/* =====================================
   RENDER BRACKET
===================================== */

function renderBracket() {

    const container =
        document.getElementById(
            "bracketContainer"
        );

    if (!container)
        return;

    container.innerHTML = "";

    bracketRounds.forEach(
        (
            round,
            roundNumber
        ) => {

            const column =
                document.createElement(
                    "div"
                );

            column.className =
                "round";

            const title =
                document.createElement(
                    "h2"
                );

            title.innerText =
                getRoundName(
                    round.length
                );

            column.appendChild(
                title
            );

            round.forEach(
                (
                    match,
                    matchIndex
                ) => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "bracketMatch";

                    card.innerHTML =
                    `
                    <div class="bracketPlayer">

                        <span>
                        ${match.player1 ?? "TBD"}
                        </span>

                        <input
                        type="number"
                        min="0"
                        value="${match.score1}"
                        onchange="
                        setBracketScore(
                        ${roundNumber},
                        ${matchIndex},
                        1,
                        this.value
                        )
                        "
                        >

                    </div>

                    <div class="bracketPlayer">

                        <span>
                        ${match.player2 ?? "TBD"}
                        </span>

                        <input
                        type="number"
                        min="0"
                        value="${match.score2}"
                        onchange="
                        setBracketScore(
                        ${roundNumber},
                        ${matchIndex},
                        2,
                        this.value
                        )
                        "
                        >

                    </div>
                    `;

                    column.appendChild(
                        card
                    );

                }
            );

            container.appendChild(
                column
            );

        }
    );

}

/* =====================================
   ROUND NAMES
===================================== */

function getRoundName(
    matches
) {

    const players =
        matches * 2;

    if (
        players >= 48
    )
        return "Round of 48";

    if (
        players === 32
    )
        return "Round of 32";

    if (
        players === 16
    )
        return "Round of 16";

    if (
        players === 8
    )
        return "Quarter Finals";

    if (
        players === 4
    )
        return "Semi Finals";

    if (
        players === 2
    )
        return "Final";

    return "Round";

}

/* =====================================
   ENTER SCORES
===================================== */

function setBracketScore(
    round,
    match,
    player,
    value
) {

    const game =
        bracketRounds[
            round
        ][
            match
        ];

    if (
        player === 1
    ) {

        game.score1 =
            value;

    }

    else {

        game.score2 =
            value;

    }

    determineWinner(
        round,
        match
    );

    saveBracket();

    renderBracket();

}

/* =====================================
   DETERMINE WINNER
===================================== */

function determineWinner(
    roundIndex,
    matchIndex
) {

    const match =
        bracketRounds[
            roundIndex
        ][
            matchIndex
        ];

    if (
        match.score1 === "" ||
        match.score2 === ""
    )
        return;

    if (
        Number(
            match.score1
        ) >
        Number(
            match.score2
        )
    ) {

        match.winner =
            match.player1;

    }

    else if (

        Number(
            match.score2
        ) >
        Number(
            match.score1
        )

    ) {

        match.winner =
            match.player2;

    }

    else {

        return;

    }

    advanceWinner(
        roundIndex,
        matchIndex
    );

}

/* =====================================
   ADVANCE WINNERS
===================================== */

function advanceWinner(
    roundIndex,
    matchIndex
) {

    const winner =
        bracketRounds[
            roundIndex
        ][
            matchIndex
        ].winner;

    if (
        !winner
    )
        return;

    if (
        !bracketRounds[
            roundIndex + 1
        ]
    ) {

        bracketRounds[
            roundIndex + 1
        ] = [];

    }

    const nextMatch =
        Math.floor(
            matchIndex / 2
        );

    if (
        !bracketRounds[
            roundIndex + 1
        ][
            nextMatch
        ]
    ) {

        bracketRounds[
            roundIndex + 1
        ][
            nextMatch
        ] = {

            player1: null,
            player2: null,

            score1: "",
            score2: "",

            winner: null

        };

    }

    const target =
        bracketRounds[
            roundIndex + 1
        ][
            nextMatch
        ];

    if (
        matchIndex % 2 === 0
    ) {

        target.player1 =
            winner;

    }

    else {

        target.player2 =
            winner;

    }

    renderBracket();

    checkChampion();

}

/* =====================================
   CHAMPION
===================================== */

function checkChampion() {

    const last =
        bracketRounds[
            bracketRounds.length - 1
        ];

    if (
        !last
    )
        return;

    if (
        last.length !== 1
    )
        return;

    const final =
        last[0];

    if (
        !final.winner
    )
        return;

    launchConfetti();

    setTimeout(
        () => {

            alert(
                `🏆 ${final.winner}
                wins the World Cup Sweepstake!`
            );

        },
        500
    );

}

/* =====================================
   SAVE BRACKET
===================================== */

function saveBracket() {

    localStorage.setItem(

        "wcBracket",

        JSON.stringify(
            bracketRounds
        )

    );

}

/* =====================================
   LOAD BRACKET
===================================== */

function loadBracket() {

    const save =
        localStorage.getItem(
            "wcBracket"
        );

    if (
        !save
    )
        return;

    bracketRounds =
        JSON.parse(
            save
        );

    renderBracket();

}
