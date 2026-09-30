(function() {
    function getAnyScrollTop() {
        return Math.max(
            window.pageYOffset || 0,
            document.documentElement.scrollTop || 0,
            document.body.scrollTop || 0
        );
    }

    function getDocumentHeight() {
        return Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight,
            document.body.clientHeight,
            document.documentElement.clientHeight
        );
    }

    function getWindowHeight() {
        return window.innerHeight || document.documentElement.clientHeight || 0;
    }

    function getBestScrollTarget() {
        if (document.body.scrollTop > 0 || getComputedStyle(document.body).overflowY === 'auto' || getComputedStyle(document.body).overflowY === 'scroll') {
            return document.body;
        }
        if (document.documentElement.scrollTop > 0 || getComputedStyle(document.documentElement).overflowY === 'auto' || getComputedStyle(document.documentElement).overflowY === 'scroll') {
            return document.documentElement;
        }
        return window;
    }

    function addMultiScrollListener(fn) {
        const targets = [window, document.documentElement, document.body];
        targets.forEach(function(t) {
            if (t && t.addEventListener) {
                t.addEventListener('scroll', fn, { passive: true });
            }
        });
    }

    function initProgressIndicator() {
        const progressCircle = document.querySelector('.progress-circle');
        const progressBar = document.querySelector('.progress-bar');
        const percentageText = document.querySelector('.scroll-percentage');

        if (!progressCircle || !progressBar || !percentageText) {
            setTimeout(initProgressIndicator, 200);
            return;
        }

        const radius = 32;
        const circumference = 2 * Math.PI * radius;
        progressBar.style.strokeDasharray = circumference;
        progressBar.style.strokeDashoffset = circumference;
        percentageText.textContent = '0';

        let ticking = false;

        function updateScrollProgress() {
            const scrollTop = getAnyScrollTop();
            const documentHeight = getDocumentHeight();
            const windowHeight = getWindowHeight();
            const scrollableHeight = documentHeight - windowHeight;

            let progress = 0;
            if (scrollableHeight > 0) {
                progress = Math.min(Math.max(scrollTop / scrollableHeight, 0), 1);
            }

            const percentage = Math.round(progress * 100);
            percentageText.textContent = percentage;

            const offset = circumference - (progress * circumference);
            progressBar.style.strokeDashoffset = offset;

            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(updateScrollProgress);
            }
        }

        progressCircle.addEventListener('click', function() {
            const target = getBestScrollTarget();
            if (target === window) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                target.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        progressCircle.style.opacity = '1';
        progressCircle.style.visibility = 'visible';

        addMultiScrollListener(onScroll);
        window.addEventListener('resize', onScroll);

        updateScrollProgress();

        progressCircle.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });

        progressCircle.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });

        setTimeout(updateScrollProgress, 500);
        setTimeout(updateScrollProgress, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProgressIndicator);
    } else {
        initProgressIndicator();
    }

    window.addEventListener('load', function() {
        setTimeout(initProgressIndicator, 100);
    });
})();
