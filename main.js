let a = "";
let b = "";
let operator = "";

let operandButton = document.querySelectorAll(".operand");
let operatorButton = document.querySelectorAll(".operator");
let equalsButton = document.querySelector(".equals");
let clearButton = document.querySelector(".clear");
let text = document.querySelector(".calculator__input--text");

// let clickedEquals = false;
let operatorExists = false;

text.disabled = true;
text.value = "";

// Loop NodeList
operandButton.forEach(item => {
    // Check if element in NodeList is clicked
    item.addEventListener("click", () => {
        // Check if Operator has value
        if (operator !== "") {
            // Check if Equals button is clicked
            // if (!clickedEquals) {
                // If an operator has value and equals button is clicked
                // Update b variable and display
                text.value += item.value;
                b += item.value;
                console.log(`AFTER GETTING B VALUE: a = ${a}, b = ${b}, Op = ${operator}`);
            // }
            // If an operator already exists but equals button is clicked
            // else {
            //     text.value = operate(operator, a, b);
            //     a = text.value;
            //     b = "";
            //     operator = "";
            // }
        }
        // If Operator has no value
        else {
            // If Operator has no value
            // Update a variable and display
            text.value += item.value;
            a += item.value;
            console.log(`AFTER GETTING A VALUE: a = ${a}, b = ${b}, Op = ${operator}`);
        }      
    });
});

// Loop through the NodeList
operatorButton.forEach(item => {
    // Check if an element from the NodeList is clicked
    item.addEventListener("click", () => {
        
        // Check if a variable holds any value
        if (a !== "") {
            if (operatorExists) {
                // if (b !== ""){
                    text.value = operate(operator, a, b);
                    a = text.value;
                    b = "";
                    operator = item.value;
                    console.log(`IF OPERATOR ALREADY EXISTS: a = ${a}, b = ${b}, Op = ${operator}`);
                // }
            }
            // If a variable holds a value
            // Update the operator value and display
            operator = item.value;
            text.value += item.value;
            console.log(`AFTER GETTING OPERATOR: a = ${a}, b = ${b}, Op = ${operator}`);
            operatorExists = true;
        }
        // If a variable has no value
        // else if (operator !== "") {
        //     text.value = operate(operator, a, b);
        //     a = text.value;
        //     b = "";
        //     operator = item.value;
        //     console.log(`AFTER GETTING A SECOND OPERATOR: a = ${a}, b = ${b}, Op = ${operator}`);
        // }
    });
});

// Check if equals button is clicked
equalsButton.addEventListener("click", () => {
    // Update a, b, and operator variables and display
    // if (operator !== "") {
        // return;
    // }
    // else {
        text.value = operate(operator, a, b);
        a = text.value;
        b = "";
        operator = "";
        operatorExists = false;
        // clickedEquals = true;
        console.log(`AFTER CLICKED EQUAL BUTTON: a = ${a}, b = ${b}, Op = ${operator}`);
    // }
});

// Check if clear button is clicked
clearButton.addEventListener("click", () => {
    // Clear a, b, operator variables and display
    text.value = "";
    a = "";
    b = "";
    operator = "";
    operatorExists = false;
    console.log(`AFTER CLICKED CLEAR BUTTON: a = ${a}, b = ${b}, Op = ${operator}`);
});

function operate(operator, a, b) {
    switch(operator) {
        case "+": return add(a, b);
        case "-": return subtract(a, b);
        case "*": return multiply(a, b);
        case "/": return divide(a, b);
        default: text.value = "Enter VALID Operator!!!!!!";
    }
}

const add = (a, b) => Number(a) + Number(b);
const subtract = (a, b) => Number(a) - Number(b);
const multiply = (a, b) => Number(a) * Number(b);
const divide = (a, b) => Number(a) / Number(b);

















































// let a = "";
// let b = "";
// let operator = "";

// let operandButton = document.querySelectorAll(".operand");
// let operatorButton = document.querySelectorAll(".operator");
// let equalsButton = document.querySelector(".equals");
// let clearButton = document.querySelector(".clear");
// let textInput = document.querySelector(".calculator__input--text");

// operandButton.forEach(item => {
//     item.addEventListener("click", () => {
//         if (operator !== "") {
//             b += item.value;
//             textInput.value += item.value;
//         }
//         else {
//             a += item.value;
//             textInput.value += item.value;
//         }

//         if (a !== "" && b !== "" && operator !== "") {
//             textInput.value = operate(operator, a, b);
//         }
//     })
// });

// operatorButton.forEach(item => {
//     item.addEventListener("click", () => {
//         operator = item.value;
//         textInput.value += item.value;
//     })
// });

// equalsButton.addEventListener("click", () => {
//     operate(operator, a, b);
// });

// clearButton.addEventListener("click", () => {
//     textInput.value = "";
//     a = "";
//     b = "";
//     operator = "";
// })

// function operate(operator, a, b) {
//     switch(operator) {
//         case "+": 
//             return add(a, b);
//         case "-": 
//             return subtract(a, b);
//         case "*": 
//             return multiply(a, b);
//         case "/": 
//             return divide(a, b);
//         default: 
//             console.log("Enter a Valid Operator!!!!")
//     }
// }

// function add (a, b) {
//     textInput.value = Number(a) + Number(b);
//     return textInput.value;
// }

// function subtract (a, b) {
//     textInput.value = Number(a) - Number(b);
//     return textInput.value;
// }

// function multiply (a, b) {
//     textInput.value = Number(a) * Number(b);
//     return textInput.value;
// }

// function divide (a, b) {
//     textInput.value = Number(a) / Number(b);
//     return textInput.value;
// }