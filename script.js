let canScroll = true
let timer

document.querySelector("main").addEventListener('scroll', (e) => {
    clearTimeout(timer);
    canScroll = false
    if (e.target.scrollTop == 0) {
        document.querySelector(".overlay .up").style["opacity"] = 0
    } else {
        document.querySelector(".overlay .up").style["opacity"] = 1
    }
    if (e.target.scrollTop + e.target.clientHeight == e.target.scrollHeight) {
        document.querySelector(".overlay .down").style["opacity"] = 0
    } else {
        document.querySelector(".overlay .down").style["opacity"] = 1
    }

    timer = setTimeout(() => {
        canScroll = true
    }, 50);
}, { passive: true });

function scroll(direction) {
    const amount = window.innerHeight / 2
    if (canScroll) document.querySelector("main").scrollBy({ top: direction == "up" ? -amount : amount, behavior: "smooth" });
}

document.querySelector(".overlay").style["display"] = "flex"
const css = document.createElement("style")
css.innerHTML = "*::-webkit-scrollbar{display:none;}"
document.body.appendChild(css)