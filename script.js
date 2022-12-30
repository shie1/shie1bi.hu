let canScroll = true
let timer

async function getSectionContainerInFocus() {
    return new Promise((resolve) => {
        const sections = document.querySelectorAll(".section-container")
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target)
                    resolve(entry.target)
                }
            })
        }, { threshold: 0.5 })
        sections.forEach((section) => observer.observe(section))
    })
}

async function updateHorizontalOverlay() {
    const section = await getSectionContainerInFocus()

    document.querySelector(".overlay .left").style["opacity"] = section.scrollLeft == 0 ? 0 : 1
    document.querySelector(".overlay .right").style["opacity"] = section.querySelectorAll(".section").length == 1 ? 0 : (section.scrollWidth - section.offsetWidth) <= section.scrollLeft ? 0 : 1
}

document.querySelectorAll(".section-container").forEach((elem) => {
    elem.addEventListener('scroll', (e) => {
        clearTimeout(timer);
        canScroll = false

        document.querySelector(".overlay .left").style["opacity"] = e.target.scrollLeft == 0 ? 0 : 1
        document.querySelector(".overlay .right").style["opacity"] = (e.target.scrollWidth - e.target.offsetWidth) <= e.target.scrollLeft ? 0 : 1

        timer = setTimeout(() => {
            canScroll = true
        }, 50);
    }, { passive: true })
})

document.querySelector("main").addEventListener('scroll', (e) => {
    clearTimeout(timer);
    canScroll = false

    document.querySelector(".overlay .up").style["opacity"] = e.target.scrollTop == 0 ? 0 : 1
    document.querySelector(".overlay .down").style["opacity"] = (e.target.scrollHeight - e.target.offsetHeight) <= e.target.scrollTop ? 0 : 1

    updateHorizontalOverlay()

    timer = setTimeout(() => {
        canScroll = true
    }, 50);
}, { passive: true });

async function scroll(direction) {
    if (!canScroll) return
    const amount = window.innerHeight / 2
    const element = await direction === "up" || direction === "down" ? document.querySelector("main") : (await getSectionContainerInFocus());
    const { top, left } = (() => {
        switch (direction) {
            case "up":
                return { top: -amount, left: 0 }
            case "down":
                return { top: amount, left: 0 }
            case "left":
                return { top: 0, left: -amount }
            case "right":
                return { top: 0, left: amount }
            default:
                return { top: 0, left: 0 }
        }
    })();
    element.scrollBy({ top, left, behavior: "smooth" });
}

document.querySelectorAll(".overlay").forEach((e) => e.style["display"] = "flex")

window.addEventListener("keydown", (e) => {
    if (e.key.startsWith("Arrow")) {
        e.preventDefault()
        scroll(e.key.replace("Arrow", "").toLowerCase())
    }
})