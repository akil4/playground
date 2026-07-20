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
            let opacity = 0;

            div.classList.add("child");

            container.appendChild(div);

            div.addEventListener("mouseenter", () => {
                opacity += 0.1;

                function random() 
                {
                    return Math.floor(Math.random() * 256);
                }

                div.style.backgroundColor = `rgb(${random()}, ${random()}, ${random()})`;
                div.style.opacity = opacity;
            })
        }
    }
})