# NIM
A web-based implementation the game NIM
---------------------------------------
>**NIM** is a fairly simple game, in NIM you are given a number of piles with each pile containing some number of items. You are allowed to remove any 
>amount of objects from any pile but be warned, you have an adversary who can also pick any arbitary number of objects from a pile, you 
>both play in turns and the person to pick the last object from any pile loses. Goodluck and check out the help page on how to create 
>and play custom games of **NIM**.
>
>This is a fairly light implementation of the game. It makes use of a reinforcement learning model using **Q-learning** as the basis for estimating what actions are 
>better to be made in a state. I haven't used ***javascript*** a lot but for this project I ended up learning some cool parts of the language along the way.
>
>Well thats all, it's not a very robust game. I plan to make revisions of the game in the future like adding online players and accounts
>but until then this is a bare-bone implementation of the **NIM** Game with some extra features I could conjure up.
> ***
> ## The AI
> The routines for the AI itself are fairly simple and I'll define the main tasks of the AI below (they are implemented in the NIMAI class in (***game.js***):
> > - Actions(state)
> > - BestFutureReward(state)
> > - UpdateQValue(state, action, old_q, reward, future_rewards)
> > - Choose_Action(state, epsilon)
> > - GetQValue(state, action)
>
> ## Actions(state)
> This just returns all actions possible in a ***state*** where a state is simply a configuration of the stack of objects, and the ***actions*** are simply arrays
> containing a pile index and an object count **[pile, no_of_objects]**.
>
> ## GetQValue(state, action)
> 
> How all this and more have been implemented doesn't seem too important to mention it's the overall idea that counts
> ***
> Check my work out here *[portfolio](https://lifeofdmt.github.io)*


