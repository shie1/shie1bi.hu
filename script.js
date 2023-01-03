let canScroll = true
let timer
moment.locale("hu")

const viewsFormatter = new Intl.NumberFormat("hu-HU", { notation: "compact" })

const pipedRoot = "https://pipedapi.leptons.xyz"

fetch(pipedRoot + "/channel/UCsB9PQZp9b_ORMevZGW85jg", { method: "GET", headers: { "Content-Type": "application/json" } }).then((res) => res.json()).then(async (data) => {
    for (const video of data.relatedStreams) {
        const section = document.createElement("div")
        section.classList.add("section")

        const bg = document.createElement("div")
        bg.classList.add("bg", "thumbnail-bg", "no-filter")
        bg.style["background-image"] = `url(${video.thumbnail.replace(/hqdefault/g, "maxresdefault")})`
        section.appendChild(bg)

        const link = document.createElement("a")
        link.href = `https://youtu.be/${video.url.split("=")[1]}`
        link.target = "_blank"
        link.rel = "noopener noreferrer external"
        const thumbnail = document.createElement("img")
        thumbnail.draggable = false
        thumbnail.classList.add("thumbnail")
        thumbnail.src = video.thumbnail.replace(/hqdefault/g, "maxresdefault")
        section.appendChild(link)
        link.appendChild(thumbnail)

        const titleGroup = document.createElement("div")
        titleGroup.classList.add("title-group")
        video.title.split(" | ").map((line, i) => {
            const h = document.createElement(`h${i + 2}`)
            h.innerText = line
            titleGroup.appendChild(h)
        })
        section.appendChild(titleGroup)

        const info = document.createElement("p")
        const infoFirst = video.views === -1 ? "Közelgő premier" : `${viewsFormatter.format(video.views)} megtekintés`
        info.innerText = `${infoFirst} • ${moment(video.uploaded).fromNow()}`
        section.appendChild(info)

        document.querySelector(".section-container#shie1bi").appendChild(section)
    }
})

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
        if (!canScroll) { e.preventDefault() }
        canScroll = false

        document.querySelector(".overlay .left").style["opacity"] = e.target.scrollLeft == 0 ? 0 : 1
        document.querySelector(".overlay .right").style["opacity"] = (e.target.scrollWidth - e.target.offsetWidth) <= e.target.scrollLeft ? 0 : 1

        timer = setTimeout(() => {
            canScroll = true
        }, 50);
    }, { passive: false })
})

window.addEventListener("wheel", (e) => {
    e.preventDefault()
    if (e.deltaY > 0) {
        scroll("down")
    } else {
        scroll("up")
    }
}, { passive: false })

window.addEventListener("click", (e) => {
    console.log(e)
}, { passive: false })

document.querySelector("main").addEventListener('scroll', (e) => {
    clearTimeout(timer);
    if (!canScroll) { e.preventDefault() }
    canScroll = false

    document.querySelector(".overlay .up").style["opacity"] = e.target.scrollTop == 0 ? 0 : 1
    document.querySelector(".overlay .down").style["opacity"] = (e.target.scrollHeight - e.target.offsetHeight) <= e.target.scrollTop ? 0 : 1

    updateHorizontalOverlay()

    timer = setTimeout(() => {
        canScroll = true
    }, 50);
}, { passive: false });

async function scroll(direction) {
    if (!canScroll) return
    const amount = window.innerHeight / 2
    const element = await (async () => {
        switch (direction) {
            case "up":
            case "down":
                return document.querySelector("main")
            case "left":
            case "right":
                return (await getSectionContainerInFocus())
            default:
                return document.querySelector("main")
        }
    })();
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