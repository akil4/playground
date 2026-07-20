const container = document.querySelector(".container");
const resetBtn = document.querySelector(".resetBtn");

resetBtn.addEventListener("click", () => {
    const N = prompt("Number of squares per side: ");
    container.innerHTML = "";

    for (let i = 0; i < N; i++)
    {
        for (let j = 0; j < N; j++)
        {
            const div = document.createElement("div");
            div.classList.add("child");
            container.appendChild(div);

            div.addEventListener("mouseenter", () => {
                div.style.backgroundColor = "red";
            })
        }
    }
})