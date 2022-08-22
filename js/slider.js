var curListener;

dragElement = (target) => {
    const color = target.querySelector('.slider__color');
    const tooltip = null; //target.querySelector('.slider__tooltip');
    const btn = target.querySelector(".slider__btn");

    var event = new CustomEvent("onSliderChanged", {detail: {
        value: 0.5
    }});

    target.addEventListener('mousedown', (e) => {
        onMouseMove(e, target, btn, color, tooltip);
        curListener = (e) => {
            onMouseMove(e, target, btn, color, tooltip);
        }
        window.addEventListener('mousemove', curListener);
        window.addEventListener('mouseup', (e) => {
            onMouseUp(e, target, btn, color, tooltip);
        });
    });

    onMouseMove = (e, target, btn, color, tooltip) => {
        e.preventDefault();
        let targetRect = target.getBoundingClientRect();
        let x = e.pageX - targetRect.left + 10;
        if (x > targetRect.width) { x = targetRect.width };
        if (x < 0) { x = 0 };
        btn.x = x - 10;
        btn.style.left = btn.x + 'px';

        let percentPosition = (btn.x + 10) / targetRect.width * 100;

        color.style.width = percentPosition + "%";

        // tooltip.style.left = btn.x - 5 + 'px';
        // tooltip.style.opacity = 1;

        // tooltip.textContent = Math.round(percentPosition) + '%';

        event.detail.value = (btn.x + 10) / targetRect.width;
        target.dispatchEvent(event);
    };

    onMouseUp = (e, target, btn, color, tooltip) => {
        window.removeEventListener('mousemove', curListener);
        // tooltip.style.opacity = 0;

        btn.addEventListener('mouseover', function () {
            // tooltip.style.opacity = 1;
        });

        btn.addEventListener('mouseout', function () {
            // tooltip.style.opacity = 0;
        });
    };
};

const sliders = document.getElementsByClassName("slider__box");

for (let index = 0; index < sliders.length; index++) {
    var containerce = sliders[index];

    dragElement(containerce);
}
