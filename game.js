function selectWithProbability(probabilities)
{
    const cumulativeProbabilities = [probabilities[0]];

    for (let i = 1; i < probabilities.length; i++) 
    {
        cumulativeProbabilities[i] = cumulativeProbabilities[i - 1] + probabilities[i];
    }

    const random = Math.random();

    // Ensure that random is within the range of cumulative probabilities
    if (random > cumulativeProbabilities[cumulativeProbabilities.length - 1]) {
        throw new Error("Random number exceeds cumulative probabilities.");
    }

    const selectedIndex = cumulativeProbabilities.findIndex(prob => prob > random);
    return selectedIndex;
}

function sortByIndex(arrOfArrays, index) 
{
    return arrOfArrays.sort((a, b) => b[index] - a[index]);
}

class Nim
{
    constructor(piles)
    {
        this.piles = [];
        for (let i = 0; i < piles; i++)
        {
            this.piles.push(i+1);
        }
        this.player = 0;
        this.winner = undefined;
    }
    
    available_actions(piles)
    {
        let actions = [];

        for (let i = 0; i < piles.length; i++)
        {
            for (let j = 0; j < piles[i]; j++)
            {
                actions.push([i,j+1]);
            }
        }
        return actions;
    }
    
    other_player(player)
    {
        /*
        Nim.other_player(player) returns the player that is not
        `player`. Assumes `player` is either 0 or 1.
        */
        return player == 1 ? 0 : 1;
    }

    switch_player()
    {
        /*
        Switch the current player to the other player.
        */
        this.player = this.other_player(this.player);
    }

    move(action)
    {
        /*
        Make the move `action` for the current player.
        `action` must be a tuple `(i, j)`.
        */
    
        let pile = action[0];
        let count = action[1];

        // Check for errors
        if (this.winner !== undefined)
        {
            throw new Error("Game already won.");
        }
        else if (pile < 0 || pile >= this.piles.length)
        {
            throw new Error("Invalid pile.");   
        }
        else if (count < 1 || count > this.piles[pile])
        {
            throw new Error("Invalid number of objects.");      
        }

        // Update pile
        this.piles[pile] -= count;
        this.switch_player();

        // Check for a winner
        if (Math.max(...this.piles) == 0)
        {
            this.winner = this.player;
        }
    }

    // Draw piles on screen
    draw()
    {
        let game = document.querySelector("#game");
        const colors1 = ["#04aa6d", "#88e0d0", "#b1e9a3", "#117c92"];
        const colors2 = ["#00575d", "lightseagreen", "#7ac38f"];

        // Calculate total probabilities to normalize the distribution
        const totalProbabilities = colors1.length * colors2.length;
        
        // Calculate the actual probabilities for each combination of colors
        const probabilities = colors1.map(color1 =>
            colors2.map(color2 =>
            1 / totalProbabilities
            )
        ).flat();

        for (let i = 0; i < this.piles.length; i++) 
        {
            let div = document.createElement("div");
            div.setAttribute("class", "circ_inline");

            // Randomly select a combination of colors with the updated probabilities
            let randomIndex = selectWithProbability(probabilities);
            let color1 = colors1[Math.floor(randomIndex / colors2.length)];
            let color2 = colors2[randomIndex % colors2.length];

            for (let j = 0; j < this.piles[i]; j++) 
            {
                let circle = document.createElement("div");

                // Add text
                let text = document.createElement("h3");
                text.innerHTML = `${i + 1}`;
                text.style.color = "white";
                text.setAttribute("class", "text-centred");
                text.style.userSelect = "none";

                // Set circle's properties
                circle.append(text);
                circle.setAttribute("class", `circle pile${i + 1}`);
                circle.style.backgroundImage = `linear-gradient(to right, ${color1}, ${color2})`;

                div.append(circle);
            }
            game.append(div);
        }
    }

    clear()
    {

        let circles = document.querySelectorAll(".circ_inline");
        for (let i = 0; i < circles.length; i++)
        {
            circles[i].remove();
        }
    }

    restructure(action, no_of_piles)
    {
        // Continue with your code here...
        let pile = document.querySelectorAll(`.pile${action[0] + 1}`);
        let number = action[1];
                    
        if (number > pile.length || number < 0)
        {
            alert(`You do not have that many objects in pile ${action[0]}`);
        }
        
        else
        {
            for (let i = 0; i < number; i++)
            {
                pile[i].remove();
            } 
        }
    }
}

class NimAI
{
    constructor(alpha=0.5, epsilon=0.1)
    {
        this.q = new Object();
        this.alpha = alpha;
        this.epsilon = epsilon;
    }

    update(old_state, action, new_state, reward)
    {
        /*
        Update Q-learning model, given an old state, an action taken
        in that state, a new resulting state, and the reward received
        from taking that action.
        */
        let old = this.get_q_value(old_state, action);
        let best_future = this.best_future_reward(new_state);
        this.update_q_value(old_state, action, old, reward, best_future);
    }

    get_q_value(state, action)
    {
        /*
        Return the Q-value for the state `state` and the action `action`.
        If no Q-value exists yet in `self.q`, return 0.
        */
       let q_value = this.q[JSON.stringify([state,action])];

       if (q_value !== undefined)
       {
            return q_value;
       }
       else
       {
            return 0;
       }
    }

    actions(state)
    {
        /*
        Return a set of all actions performable in a given state
        */
        let actions = [];
        for (let pile = 0; pile < state.length; pile++)
        {
            for (let object = 0; object < state[pile]; object++)
            {
                actions.push([pile,object + 1]);
            }
        }
        return actions;
    }

    update_q_value(state, action, old_q, reward, future_rewards)
    {
        /*
        Update the Q-value for the state `state` and the action `action`
        given the previous Q-value `old_q`, a current reward `reward`,
        and an estiamte of future rewards `future_rewards`.

        Use the formula:

        Q(s, a) <- old value estimate
                + alpha * (new value estimate - old value estimate)

        where `old value estimate` is the previous Q-value,
        `alpha` is the learning rate, and `new value estimate`
        is the sum of the current reward and estimated future rewards.
        */
        this.q[JSON.stringify([state, action])] = old_q + (this.alpha * ((reward + future_rewards) - old_q));
    }

    best_future_reward(state)
    {
        /*
        Given a state `state`, consider all possible `(state, action)`
        pairs available in that state and return the maximum of all
        of their Q-values.

        Use 0 as the Q-value if a `(state, action)` pair has no
        Q-value in `self.q`. If there are no available actions in
        `state`, return 0.
        */

        let values = [];

        // Check if no other possible action a in state s
        if (Math.max(...state) == 0)
        {
            return 0;
        }
        
        let possible_actions = this.actions(state);
        for (let i = 0; i < possible_actions.length; i++)
        {
            let q_value = this.q[JSON.stringify([state, possible_actions[i]])];
            if (q_value !== undefined)
            {
                values.push(q_value);
            }
            else
            {
                values.push(0);
            }
            return Math.max(...values);
        }
    }

    choose_action(state, epsilon=true)
    {
        /*
        Given a state `state`, return an action `(i, j)` to take.

        If `epsilon` is `False`, then return the best action
        available in the state (the one with the highest Q-value,
        using 0 for pairs that have no Q-values).

        If `epsilon` is `True`, then with probability
        `self.epsilon` choose a random available action,
        otherwise choose the best action available.

        If multiple actions have the same Q-value, any of those
        options is an acceptable return value.
        */

        const vap = [];

        // Store a value-action pair for every state
        let possible_actions = this.actions(state);
        for (let i = 0; i < possible_actions.length; i++)
        {
            vap.push([this.get_q_value(state,possible_actions[i]), possible_actions[i]]);
        }
        const q_values = sortByIndex(vap, 0);

        // Return the best choice if using a purely greedy approach
        if (epsilon == false)
        {
            return q_values[0][1];
        }
        else
        {
            // Get max-value of all the actions
            let max_value = q_values[0][0];

            // Get number of actions that have the best value or not
            let best = 0;
            let worst = 0;

            for (let i = 0; i < vap.length; i++)
            {
                vap[i][0] == max_value ? best += 1 : worst += 1;
            }

            let transition = [];

            for (let i = 0; i < best; i++)
            {
                worst == 0 ? transition.push(1 / best) : transition.push((1-this.epsilon) / best);
            }

            for (let i = 0; i < worst; i++)
            {
                transition.push(this.epsilon / worst);
            }
            const selectedIndex = selectWithProbability(transition);
            return vap[selectedIndex][1];
        }
    }
}

function delay(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

function train(n, no_of_piles)
{
    /*
    Train an AI by playing `n` games against itself.
    */
    let player = new NimAI();

    // Play n games
    for (let i = 0; i < n; i++)
    {
        let game = new Nim(no_of_piles);

        // Keep track of last move made by either player
        let last = {
            0: {"state": undefined, "action": undefined},
            1: {"state": undefined, "action": undefined}
        };

        // Game loop
        while (true)
        {
            // Keep track of current state and action
            let state = [...game.piles];
            let action = player.choose_action(game.piles);

            // Keep track of last state and action
            last[game.player]["state"] = state;
            last[game.player]["action"] = action;

            // Make move
            game.move(action);
            let new_state = [...game.piles];

            // When game is over, update Q values with rewards
            if (game.winner !== undefined)
            {
                player.update(state, action, new_state, -1);
                player.update(last[game.player]["state"], last[game.player]["action"], new_state, 1);
                break;
            }

            // If game is continuing, no rewards yet
            else if (last[game.player]["state"] != undefined)
            {
                player.update(last[game.player]["state"],last[game.player]["action"],new_state,0);
            }
        } 
    }

    console.log("Done training");

    // Return the trained AI
    return player;
}

function play(ai, no_of_piles, human_player = undefined) 
{
    /*
    Play human game against the AI.
    `human_player` can be set to 0 or 1 to specify whether
    human player moves first or second.
    */

    // If no player order set, choose human's order randomly
    if (human_player == undefined) {
        human_player = Math.round(Math.random());
    }

    // Create new game
    let game = new Nim(no_of_piles);
    game.draw(no_of_piles);
    let state = document.getElementById("state");
    let player = document.getElementById("player");

    // Store button elements
    const button = document.getElementById("move");
    const ai_move = document.getElementById("ai_move");
    const highlight = document.getElementById("highlight");
    const danger_moves = document.getElementById("danger-moves");
    let danger = document.querySelector("#danger");

    // Track the use of game helpers
    let ai_moves = 0;

    // Function to wait for human's move (using Promise)
    function waitForHumanMove()
    {
        return new Promise(resolve => {
        button.addEventListener('click', function getAction() {
            const pileIndex = prompt("Enter the pile index (starting from 1): ");
            const numberOfObjects = prompt("Enter the number of objects to remove: ");
            resolve([parseInt(pileIndex) - 1, parseInt(numberOfObjects)]);
        }, {once : true});

        highlight.addEventListener('click', function dangerous(){
            const vap = [];

            // Store a value-action pair for every state
            let possible_actions = ai.actions(game.piles);
            for (let i = 0; i < possible_actions.length; i++)
            {
                vap.push([ai.get_q_value(game.piles,possible_actions[i]), possible_actions[i]]);
            }
            const q_values = sortByIndex(vap, 0);
            const bad_actions = [];

            console.log(q_values);
            for (let i = 0; i < q_values.length; i++)
            {
                if (q_values[i][0] <= 0)
                {
                    let action = q_values[i][1];
                    console.log("f");
                    if (i == (q_values.length - 1))
                    {
                        bad_actions.push(`(Pile ${action[0] + 1} Action ${action[1]}).`);
                    }
                    else
                    {
                        bad_actions.push(`(Pile ${action[0] + 1} Action ${action[1]}),`);
                    }
                }
            }
            danger_moves.innerHTML = bad_actions.join(" ");
            danger.hidden = 0;
        }, {once : true});

        if (ai_moves != 2)
        {
            ai_move.addEventListener('click', function aiAction() 
            {
                ai_moves++;
                console.log(ai_moves);
                resolve(ai.choose_action(game.piles));
            }, {once : true});
        }
        });
    }

    // Game loop
    async function gameLoop() 
    {
        // Check for winner
        if (game.winner !== undefined) 
        {
            console.log("");
            console.log("GAME OVER");

            // Choose and announce winner
            let winner = game.winner == human_player ? "Human" : "AI";
            state.innerHTML = `Winner is ${winner}`
            console.log(`Winner is ${winner}`);
            player.innerHTML = "Game Over";
            button.hidden = 1;

            document.getElementById("game_over").hidden = 0;

            return;
        }

        // Compute available actions
        let actions = game.available_actions(game.piles);
        let action = [];

        // Let human make a move
        if (game.player == human_player) 
        {
            console.log("Your Turn");
            player.innerHTML = "Human";
            while (true)
            {
                action = await waitForHumanMove();
                const stringifiedArray = JSON.stringify(action);
                if (actions.some(arr => JSON.stringify(arr) === stringifiedArray))
                {
                    break;
                }
                alert("Invalid Action");
            }
           state.innerHTML = `Human chose to take ${action[1]} from pile ${action[0] + 1}.`;
           await delay(2000);
        }

        // Have AI make a move
        else
        {
            console.log("AI's Turn");
            player.innerHTML = "AI";
            action = ai.choose_action(game.piles, epsilon = false);
            state.innerHTML = `AI chooses to take ${action[1]} from pile ${action[0] + 1}.`;
            console.log(`AI chose to take ${action[1]} from pile ${action[0] + 1}.`);

            // Delay program for 2 seconds
            await delay(2000);
        }

        // Make move
        game.move(action);
        game.restructure(action);
        danger.hidden = 1;

        // Continue the game loop
        gameLoop();
    }

    // Start the game loop
    gameLoop();
}

// Get number of piles       
let no_of_piles = document.getElementById("piles").value;
let epochs = document.querySelector("#epochs");

// Begin Game
let ai = train(epochs.value, no_of_piles);
console.log(Math.round(1/2.0));

// When the page is fully loaded, hide the loading screen
window.onload = function() {
    const loadingScreen = document.getElementById("loading-screen");
    loadingScreen.style.display = "none";
    play(ai, no_of_piles);
};