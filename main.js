// console.log("Hello, World!");
/* ALGORITHM

* GET computer choice
    * DECLARE an array of three strings
    * SELECT a random element from the array
    * RETURN the element
* GET human choice
    * PROMPT user for input
    * GET input and store in a variable
    * RETURN the element
* DECLARE score variables for computer and player
* START game
    * INVOKE humanChoice()
    * INVOKE computerChoice()
    * IF rock vs paper
    * THEN paper wins => INCREMENT score
    * ELSE IF rock vs scissors
    * THEN rock wins => INCREMENT score
    * ELSE IF paper vs scissors
    * THEN scissors win => INCREMENT score
    * ELSE IF (rock vs rock) OR (paper vs paper) OR (scissors vs scissors)
    * THEN call playRound()
    * ENDIF

*/

let humanScore = 0;
let computerScore = 0;

const rockBtn = document.querySelector("#rock");
const paperBtn = document.querySelector("#paper");
const scissorsBtn = document.querySelector("#scissors");

const resultDiv = document.querySelector(".result");

rockBtn.addEventListener("click", () => playRound("rock", getComputerChoice()));
paperBtn.addEventListener("click", () => playRound("paper", getComputerChoice()));
scissorsBtn.addEventListener("click", () => playRound("scissors", getComputerChoice()));

function updateScore()
{
    resultDiv.textContent = `Human Score: ${humanScore} | Computer Score: ${computerScore}`;
    
    if (humanScore === 5)
    {
        resultDiv.textContent = `HUMAN WINS!`;
        rockBtn.disabled = true;
        paperBtn.disabled = true;
        scissorsBtn.disabled = true;
        return;
    }
    if (computerScore === 5)
    {
        resultDiv.textContent = `COMPUTER WINS!`;
        rockBtn.disabled = true;
        paperBtn.disabled = true;
        scissorsBtn.disabled = true;
        return;
    }
}

// for (let i = 0; i < 5; i++)
// {
//     playRound(getHumanChoice(), getComputerChoice());
// }

console.log("\n\n\n", humanScore>computerScore?"You Win!":humanScore===computerScore?"Draw, try again!":"You Lose!");
/* console.log("Human Score: ", humanScore);
console.log("Computer Score: ", computerScore); */

function getComputerChoice()
{
    const array = ["rock", "paper", "scissors"];

    return array[Math.floor(Math.random() * array.length)];
    // console.log(array[Math.floor(Math.random() * array.length)]);

    /* const var1 = "rock";
    const var2 = "paper";
    const var3 = "scissors";
    let random = Math.floor((Math.random() * 3));
    return random===0?var1:random==1?var2:var3;
    console.log(random); */
}

function getHumanChoice()
{
    return prompt("Enter your choice: ").toLowerCase();
    // console.log(humanChoice.toString());
}

function playRound(humanChoice, computerChoice)
{
    if (humanChoice === "rock" && computerChoice === "paper")
    {
        computerScore++;
        console.log("You Lose! Paper beats Rock.");
    }
    else if (humanChoice === "rock" && computerChoice === "scissors")
    {
        humanScore++;
        console.log("You Win! Rock beats Scissors.");
    }
    else if (humanChoice === "paper" && computerChoice === "rock")
    {
        humanScore++;
        console.log("You Win! Paper beats Rock.");
    }
    else if (humanChoice === "paper" && computerChoice === "scissors")
    {
        computerScore++;
        console.log("You Lose! Scissors beat Paper.");
    }
    else if (humanChoice === "scissors" && computerChoice === "rock")
    {
        computerScore++;
        console.log("You Lose! Rock beats Scissors.");
    }
    else if (humanChoice === "scissors" && computerChoice === "paper")
    {
        humanScore++;
        console.log("You Win! Scissors beat Paper.");
    }
    else if (humanChoice === computerChoice)
    {
        console.log("Draw!");
        return;
    }

    updateScore();
}