document.addEventListener("DOMContentLoaded", function () {
    // 导航栏切换
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                });
                // 关闭移动端菜单
                navLinks.classList.remove("active");
            }
        });
    });

    // 页面滚动时导航栏样式变化
    window.addEventListener("scroll", () => {
        const navbar = document.querySelector(".navbar");
        if (window.scrollY > 50) {
            navbar.style.background = "rgba(255, 255, 255, 0.95)";
            navbar.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
        } else {
            navbar.style.background = "rgba(255, 255, 255, 0.95)";
            navbar.style.boxShadow = "none";
        }
    });

    // 表单提交处理
    const contactForm = document.querySelector(".contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            alert("感谢您的咨询，我们会尽快与您联系！");
            this.reset();
        });
    }

    // 轮播图功能
    const slider = document.querySelector(".trainer-slider");
    const slides = document.querySelectorAll(".trainer-card");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const dotsContainer = document.querySelector(".carousel-dots");

    let currentSlide = 1; // 从真实的第一张开始
    const totalSlides = slides.length - 2; // 减去首尾两个复制的卡片
    let isTransitioning = false;

    // 初始化位置
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;

    // 创建轮播点（只为真实的卡片创建点）
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToSlide(i + 1));
        dotsContainer.appendChild(dot);
    }

    const dots = document.querySelectorAll(".dot");

    function updateDots() {
        const realIndex =
            currentSlide === 0
                ? totalSlides - 1
                : currentSlide === totalSlides + 1
                    ? 0
                    : currentSlide - 1;
        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === realIndex);
        });
    }

    function handleTransitionEnd() {
        if (currentSlide === 0) {
            slider.style.transition = "none";
            currentSlide = totalSlides;
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        } else if (currentSlide === totalSlides + 1) {
            slider.style.transition = "none";
            currentSlide = 1;
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        setTimeout(() => {
            slider.style.transition = "transform 0.5s ease";
            isTransitioning = false;
        }, 10);
    }

    function goToSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;
        currentSlide = index;
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateDots();
    }

    function nextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentSlide++;
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateDots();
    }

    function prevSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentSlide--;
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateDots();
    }

    slider.addEventListener("transitionend", handleTransitionEnd);
    prevBtn.addEventListener("click", prevSlide);
    nextBtn.addEventListener("click", nextSlide);

    // 自动轮播
    let autoplayInterval = setInterval(nextSlide, 5000);

    // 鼠标悬停时暂停自动轮播
    const carouselContainer = document.querySelector(".trainer-carousel");
    carouselContainer.addEventListener("mouseenter", () => {
        clearInterval(autoplayInterval);
    });

    carouselContainer.addEventListener("mouseleave", () => {
        autoplayInterval = setInterval(nextSlide, 5000);
    });
});
