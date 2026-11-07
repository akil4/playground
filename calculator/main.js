let a = "";
let b = "";
let operator = "";

let operandButton = document.querySelectorAll(".operand");
let operatorButton = document.querySelectorAll(".operator");
let equalsButton = document.querySelector(".equals");
let clearButton = document.querySelector(".clear");
let text = document.querySelector(".calculator__input--text");

let operatorExists = false;

text.disabled = true;
text.value = "";

operandButton.forEach(item => {
    item.addEventListener("click", () => {
        if (operator !== "") {
            text.value += item.value;
            b += item.value;
            console.log(`AFTER GETTING B VALUE: a = ${a}, b = ${b}, Op = ${operator}`);
        }
        else {
            text.value += item.value;
            a += item.value;
            console.log(`AFTER GETTING A VALUE: a = ${a}, b = ${b}, Op = ${operator}`);
        }      
    });
});

operatorButton.forEach(item => {
    item.addEventListener("click", () => {
        if (a !== "") {
            if (operatorExists) {
                text.value = operate(operator, a, b);
                a = text.value;
                b = "";
                operator = item.value;
                console.log(`IF OPERATOR ALREADY EXISTS: a = ${a}, b = ${b}, Op = ${operator}`);
            }
            operator = item.value;
            text.value += item.value;
            console.log(`AFTER GETTING OPERATOR: a = ${a}, b = ${b}, Op = ${operator}`);
            operatorExists = true;
        }
    });
});

equalsButton.addEventListener("click", () => {
    if (operator === "" || a === "" || b === "") {
        return;
    }
    else {
        text.value = operate(operator, a, b);
        a = text.value;
        b = "";
        operator = "";
        operatorExists = false;
        console.log(`AFTER CLICKED EQUAL BUTTON: a = ${a}, b = ${b}, Op = ${operator}`);
    }
});

clearButton.addEventListener("click", () => {
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