document.addEventListener("DOMContentLoaded", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
document.addEventListener("DOMContentLoaded", function () {
    const text = "Aslam-o-Alaikum! Raja Usama here & Welcome to my Portfolio";
    const typedTextElement = document.getElementById("typed-text");
    let index = 0;

    function typeWriter() {
        if (index < text.length) {
            typedTextElement.innerHTML += text.charAt(index);
            index++;
            setTimeout(typeWriter, 80); // Speed of typing
        }
    }

    typeWriter();
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded!");
    const text2 = "WebGIS Interactive Mapping";
    const typedTextElement2 = document.getElementById("webwriteup");
    let index = 0;

    if (!typedTextElement2) {
        console.error("Element with id 'webwriteup' not found!");
        return;
    }

    function typeWriter2() {
        if (index < text2.length) {
            typedTextElement2.innerHTML += text2.charAt(index);
            index++;
            setTimeout(typeWriter2, 80);
        }
    }

    typeWriter2();
});
