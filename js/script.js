// Toggle Navbar
document.addEventListener('DOMContentLoaded', () => {
    let menuIcon = document.querySelector('#menu-icon');
    let navbar = document.querySelector('.navbar');

    if (menuIcon && navbar) {
        menuIcon.onclick = () => {
            menuIcon.classList.toggle('bx-x');
            navbar.classList.toggle('active');
        };
    }

    // Active Navbar Links on Scroll
    let sections = document.querySelectorAll('section');
    let navlinks = document.querySelectorAll('header nav a');

    window.onscroll = () => {
        sections.forEach(sec => {
            let top = window.scrollY;
            let offset = sec.offsetTop - 150;
            let height = sec.offsetHeight;
            let id = sec.getAttribute('id');

            if (top >= offset && top < offset + height) {
                navlinks.forEach(links => {
                    links.classList.remove('active');
                    let link = document.querySelector('header nav a[href*=' + id + ']');
                    if (link) {
                        link.classList.add('active');
                    }
                });
            }
        });

        let header = document.querySelector('header');
        if (header) {
            header.classList.toggle('sticky', window.scrollY > 100);
        }

        if (menuIcon && navbar) {
            menuIcon.classList.remove('bx-x');
            navbar.classList.remove('active');
        }
    };

    // Scroll Reveal Animations
    ScrollReveal({
        distance: '80px',
        duration: 2000,
        delay: 200
    });

    ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
    ScrollReveal().reveal('.home-img, .gallery-container, .services-box, .contact form', { origin: 'bottom' });
    ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
    ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });
    ScrollReveal().reveal('.sr-element', { origin: 'bottom', delay: 400 });

    // Validate Time Interval
    function validateTimeInterval(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return minutes % 30 === 0;
    }

    const bookingForm = document.getElementById('booking-form');
    const serviceColors = {
        "dry-sauna": "#ff7f50", // Coral
        "sauna-rental": "#6a5acd", // SlateBlue
        "busy-bees": "#ff69b4", // HotPink
        "ritual-rejuvenation": "#20b2aa", // LightSeaGreen
        "bachelorettes-birthdays": "#ffa07a" // LightSalmon
    };

    if (bookingForm) {
        // Populate Time Options
        function populateTimeOptions() {
            const timeSelect = document.getElementById('time');
            timeSelect.innerHTML = '';

            const startHour = 9;
            const endHour = 21;

            for (let hour = startHour; hour < endHour; hour++) {
                for (let minutes = 0; minutes < 60; minutes += 30) {
                    const timeString = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    const option = document.createElement('option');
                    option.value = timeString;
                    option.textContent = timeString;
                    timeSelect.appendChild(option);
                }
            }
        }

        populateTimeOptions();

        const calendarEl = document.getElementById('calendar');
        if (calendarEl) {
            const calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                selectable: true,
                selectMirror: true,
                editable: true,
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                contentHeight: 'auto',
                slotMinTime: '09:00:00',
                slotMaxTime: '21:00:00',
                events: [],
                eventClassNames: function(arg) {
                    const serviceType = arg.event.title.split('\n')[0].toLowerCase();
                    return [`event-${serviceType}`];
                },
                eventDidMount: function(info) {
                    const serviceType = info.event.title.split('\n')[0].toLowerCase();
                    const eventColor = serviceColors[serviceType];
                    if (eventColor) {
                        info.el.style.backgroundColor = eventColor;
                        info.el.style.borderColor = eventColor;
                    }
                }
            });
            calendar.render();

            bookingForm.addEventListener('submit', (event) => {
                event.preventDefault();

                const service = bookingForm.services.value;
                const date = bookingForm.date.value;
                const time = bookingForm.time.value;
                const firstName = bookingForm['first-name'].value;
                const lastName = bookingForm['last-name'].value;
                const phone = bookingForm.phone.value;
                const email = bookingForm.email.value;
                const durationString = bookingForm.duration.value;

                if (!service) {
                    alert('Please select a service.');
                    return;
                }

                const duration = parseFloat(durationString); // Convert the duration to a float
                if (isNaN(duration)) {
                    alert('Invalid duration selected.');
                    return;
                }

                const dateTime = new Date(`${date}T${time}`);
                const endDateTime = new Date(dateTime);
                endDateTime.setHours(dateTime.getHours() + Math.floor(duration));
                endDateTime.setMinutes(dateTime.getMinutes() + (duration % 1) * 60);

                const conflictingEvents = calendar.getEvents().filter(event => {
                    const eventStart = new Date(event.start);
                    const eventEnd = new Date(event.end);
                    const hasOverlap = (
                        (dateTime >= eventStart && dateTime < eventEnd) ||
                        (endDateTime > eventStart && endDateTime <= eventEnd) ||
                        (eventStart >= dateTime && eventStart < endDateTime)
                    );

                    return hasOverlap && event.title.includes(service);
                });

                if (conflictingEvents.length > 0) {
                    alert('The selected service is already booked within this time slot. Please choose a different time.');
                    return;
                }

                calendar.addEvent({
                    title: `${service}\n${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email}`,
                    start: dateTime,
                    end: endDateTime,
                    allDay: false
                });

                alert(`You have requested: ${service} on ${date} at ${time}.\nName: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email}`);
                bookingForm.reset();
            });
        }
    }

    // Popup functionality
    const popupOverlay = document.getElementById('service-popup');
    if (popupOverlay) {
        const closeButton = popupOverlay.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                popupOverlay.style.display = 'none';
            });
        }

        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) {
                popupOverlay.style.display = 'none';
            }
        });
    }

    const readMoreButtons = document.querySelectorAll('.services-box .btn');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();

            // Get the data attributes from the button
            const title = button.getAttribute('data-title');
            const description = button.getAttribute('data-description');
            const length = button.getAttribute('data-length'); // Replace commas with <br> for new lines
            const price = button.getAttribute('data-price');
            const details = button.getAttribute('data-details').replace(/\|/g, '<br>');

            // Customize the popup content
            document.getElementById('popup-title').textContent = title;
            document.getElementById('popup-people').innerHTML = `<i class='bx bxs-group'></i>: ${description}`; 
            document.getElementById('popup-length').innerHTML = `<div class="icon-align"><i class='bx bx-time'></i> :&nbsp${length}</div></div>`;
            document.getElementById('popup-price').innerHTML = `<i class='bx bx-dollar' ></i>: ${price}`;
            document.getElementById('popup-details').innerHTML = details; // Use innerHTML to allow for <br> tags

            popupOverlay.style.display = 'flex';
        });
    });

    // Update Service Options
    const servicesElement = document.getElementById("services");
    if (servicesElement) {
        servicesElement.addEventListener("change", updateServiceOptions);
    }

    // Populate time options dynamically (example: every 30 minutes from 9:00 AM to 9:00 PM)
    const timeSelect = document.getElementById("time");
    if (timeSelect) {
        const startTime = 9; // 9:00 AM
        const endTime = 21; // 9:00 PM
        for (let hour = startTime; hour <= endTime; hour++) {
            for (let min = 0; min < 60; min += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                timeSelect.innerHTML += `<option value="${timeString}">${timeString}</option>`;
            }
        }
    }
});

function updateServiceOptions() {
    const service = document.getElementById("services").value;
    const peopleBox = document.getElementById("people-box");
    const durationBox = document.getElementById("duration-box");
    const addonsBox = document.getElementById("addons-box"); // New line to select the add-ons box
    const peopleSelect = document.getElementById("people");
    const durationSelect = document.getElementById("duration");

    if (peopleBox && durationBox && peopleSelect && durationSelect) {
        peopleBox.style.display = "none";
        durationBox.style.display = "none";
        addonsBox.style.display = "none"; // New line to hide the add-ons box initially
        peopleSelect.innerHTML = "";
        durationSelect.innerHTML = "";

        if (service === "dry-sauna" || service === "sauna-rental") {
            peopleBox.style.display = "block";
            durationBox.style.display = "block";
            addonsBox.style.display = "block"; // New line to show the add-ons box for these services
            for (let i = 1; i <= 6; i++) {
                peopleSelect.innerHTML += `<option value="${i}">${i}</option>`;
            }
            ["2.5 hrs", "3 hrs", "3.5 hrs", "4 hrs"].forEach(duration => {
                durationSelect.innerHTML += `<option value="${duration}">${duration}</option>`;
            });
        } else if (service === "busy-bees") {
            durationBox.style.display = "block";
            durationSelect.innerHTML += `<option value="2.5 hrs">2.5 hrs</option>`;
        } else if (service === "ritual-rejuvenation") {
            durationBox.style.display = "block";
            durationSelect.innerHTML += `<option value="4 hrs">4 hrs</option>`;
        } else if (service === "bachelorettes-birthdays") {
            peopleBox.style.display = "block";
            durationBox.style.display = "block";
            for (let i = 1; i <= 6; i++) {
                peopleSelect.innerHTML += `<option value="${i}">${i}</option>`;
            }
            durationSelect.innerHTML += `<option value="4 hrs">4 hrs</option>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const form = event.target;
            const formData = new FormData(form);

            fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    //alert('Your appointment has been booked successfully!');
                    form.reset();
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            alert(data["errors"].map(error => error["message"]).join(", "));
                        } else {
                            //alert('Oops! There was a problem submitting your form');
                        }
                    });
                }
            }).catch(error => {
                //alert('Oops! There was a problem submitting your form');
            });
        });
    }
});


document.addEventListener('DOMContentLoaded', function () {
    const navbarLinks = document.querySelectorAll('.navbar a');
    
    navbarLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            const sectionId = this.getAttribute('href');
            const altLink = this.getAttribute('data-alt-link');
            const section = document.querySelector(sectionId);

            if (section) {
                const sectionRect = section.getBoundingClientRect();
                const sectionInView = (
                    sectionRect.top >= 0 &&
                    sectionRect.left >= 0 &&
                    sectionRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    sectionRect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );

                if (sectionInView && altLink) {
                    event.preventDefault();
                    window.location.href = altLink;
                } else if (!sectionInView) {
                    event.preventDefault();
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});