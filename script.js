function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function showTab(tabId) {

    document.querySelectorAll(".tab")
        .forEach(t => t.classList.add("hidden"));

    document
        .getElementById(tabId)
        .classList.remove("hidden");
}

function generateDraw() {

    const players =
        document
        .getElementById("playersInput")
        .value
        .split("\n")
        .filter(x => x.trim() !== "");

    const teamsPerPlayer =
        Number(
            document.getElementById("teamsPerPlayer").value
        );

    const assignments = {};

    players.forEach(player => {
        assignments[player] = [];
    });

    const pot1 =
        shuffle(
            teams.filter(t => t.pot === 1)
        );

    players.forEach((player, i) => {

        if (i < pot1.length) {
            assignments[player].push(
                pot1[i]
            );
        }

    });

    const remaining =
        shuffle(
            teams.filter(t => t.pot !== 1)
        );

    let playerIndex = 0;

    for (const team of remaining) {

        while (
            assignments[
                players[playerIndex]
            ].length >= teamsPerPlayer
        ) {
            playerIndex =
                (playerIndex + 1)
                % players.length;
        }

        assignments[
            players[playerIndex]
        ].push(team);

        playerIndex =
            (playerIndex + 1)
            % players.length;
    }

    render(assignments);
}

function render(assignments) {

    const cards =
        document.getElementById("cards");

    cards.innerHTML = "";

    for (const player in assignments) {

        const card =
            document.createElement("div");

        card.className = "card";

        let total = 0;

        assignments[player]
            .forEach(team => {
                total += team.rating;
            });

        card.innerHTML =
            `<h2>${player}</h2>
             <h3>Strength: ${total}</h3>`;

        assignments[player]
            .forEach(team => {

                const div =
                    document.createElement("div");

                div.className = "team";

                div.innerHTML =
                    `⚽ ${team.name}
                    (${team.rating})`;

                card.appendChild(div);

            });

        cards.appendChild(card);
    }
}
