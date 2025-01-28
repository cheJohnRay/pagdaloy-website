(function($) {

    skel.breakpoints({
        xlarge: '(max-width: 1680px)',
        large:  '(max-width: 1280px)',
        medium: '(max-width: 980px)',
        small:  '(max-width: 736px)',
        xsmall: '(max-width: 480px)'
    });

    $(function() {

        var $window = $(window),
            $body = $('body'),
            $header = $('#header'),
            $banner = $('#banner');

        // Disable animations/transitions until the page has loaded.
            $body.addClass('is-loading');

            $window.on('load', function() {
                window.setTimeout(function() {
                    $body.removeClass('is-loading');
                }, 100);
            });

        // Prioritize "important" elements on medium.
            skel.on('+medium -medium', function() {
                $.prioritize(
                    '.important\\28 medium\\29',
                    skel.breakpoint('medium').active
                );
            });

        // Fix: Placeholder polyfill.
            $('form').placeholder();

        // Header.
            if (skel.vars.IEVersion < 9)
                $header.removeClass('alt');

            if ($banner.length > 0
            &&  $header.hasClass('alt')) {

                $window.on('resize', function() { $window.trigger('scroll'); });

                $banner.scrollex({
                    bottom:     $header.outerHeight(),
                    terminate:  function() { $header.removeClass('alt'); },
                    enter:      function() { $header.addClass('alt'); },
                    leave:      function() { $header.removeClass('alt'); $header.addClass('reveal'); }
                });

            }

        // Banner.

            if ($banner.length > 0) {

                // IE fix.
                    if (skel.vars.IEVersion < 12) {

                        $window.on('resize', function() {

                            var wh = $window.height() * 0.60,
                                bh = $banner.height();

                            $banner.css('height', 'auto');

                            window.setTimeout(function() {

                                if (bh < wh)
                                    $banner.css('height', wh + 'px');

                            }, 0);

                        });

                        $window.on('load', function() {
                            $window.triggerHandler('resize');
                        });

                    }

                // Video check.
                    var video = $banner.data('video');

                    if (video)
                        $window.on('load.banner', function() {

                            // Disable banner load event (so it doesn't fire again).
                                $window.off('load.banner');

                            // Append video if supported.
                                if (!skel.vars.mobile
                                &&  !skel.breakpoint('large').active
                                &&  skel.vars.IEVersion > 9)
                                    $banner.append('<video autoplay loop><source src="' + video + '.mp4" type="video/mp4" /><source src="' + video + '.webm" type="video/webm" /></video>');

                        });

                // More button.
                    $banner.find('.more')
                        .addClass('scrolly');

            }

        // Scrolly.
            if ( $( ".scrolly" ).length ) {

                var $height = $('#header').height() * 0.95;

                $('.scrolly').scrolly({
                    offset: $height
                });
            }

        // Menu.
            $('#menu')
                .append('<a href="#menu" class="close"></a>')
                .appendTo($body)
                .panel({
                    delay: 500,
                    hideOnClick: true,
                    hideOnSwipe: true,
                    resetScroll: true,
                    resetForms: true,
                    side: 'right'
                });

    });

})(jQuery);


const form = document.querySelector('form');
const subject = document.getElementById('subject');
const email = document.getElementById('email');
const message = document.getElementById('message');
const selectedValue = document.getElementById('municipality');

function getSelectedValue() {
    const displayText = selectedValue.options[selectedValue.selectedIndex].text;
    console.log("Selected Municipality:", displayText);
}

function sendEmail() {
    const displayText = selectedValue.options[selectedValue.selectedIndex].text;
    const bodyMessage = `Email: ${email.value} <br> <br> Municipality: ${displayText} <br> <br> ${message.value}`;

    Email.send({
        Host: "smtp.elasticemail.com",
        Username: "bsu.projectgis@gmail.com", 
        Password: "4722AD182A43FDC48CFE826CFBF057C19E63",
        To: 'bsu.projectgis@gmail.com, pagdaloybsutneu@gmail.com',
        From: "bsu.projectgis@gmail.com",
        Subject: subject.value,
        Body: bodyMessage
    }).then(message => {
        if (message === "OK") {
            Swal.fire({
                text: "Thank you for raising your concerns to us. Rest assured that we will work on this matter",
                icon: "success"
            });
            clearErrors(); // Clear errors after successful submission
        }
    });
}

function checkInputs() {
    const items = document.querySelectorAll(".item");

    for (const item of items) {
        if (item.value == "") {
            item.classList.add("error");
            item.parentElement.classList.add("error");
        } else {
            item.classList.remove("error");
            item.parentElement.classList.remove("error");
        }
    }

    checkEmail();
}

function checkEmail() {
    const emailReg = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    const errorTextEmail = document.querySelector(".error-text.email");

    if (!email.value.match(emailReg)) {
        email.classList.add("error");
        email.parentElement.classList.add("error");

        if (email.value != "") {
            errorTextEmail.innerText = "Enter a valid email address";
        } else {
            errorTextEmail.innerText = "Email address cannot be blank";
        }
    } else {
        email.classList.remove("error");
        email.parentElement.classList.remove("error");
        errorTextEmail.innerText = ""; // Clear error text if email is valid
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(element => {
        element.classList.remove('error');
    });
}

// Add keyup event listeners to clear errors when user starts typing
subject.addEventListener('keyup', checkInputs);
email.addEventListener('keyup', checkInputs);
message.addEventListener('keyup', checkInputs);

form.addEventListener("submit", (e) => {
    e.preventDefault();
    checkInputs();

    if ((!subject.value.trim()) ||
        (!email.value.trim()) ||
        (!message.value.trim())
    ) {
        // Fields are blank, do not send email
        return;
    }

    sendEmail();
});

