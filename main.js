    document.querySelector("#scroll-down").addEventListener("click", () => {
        window.scrollTo({
            top: document.querySelector("#about-me").offsetTop - 20,
        });
    });

    document.querySelector("#toggle-theme").addEventListener("click", () => {
        document.documentElement.classList.toggle("light-theme");
    });

    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

    if (prefersLight) {
        document.documentElement.classList.add("light-theme");
    }

    document.getElementById('form').addEventListener('submit', function(event) {
        event.preventDefault();
        submitForm(event);
    });

    async function submitForm(event) {

        const form = event.target;
        const formBtn = document.querySelector('.form__btn');
        const formSendResult = document.querySelector('.form__send-result');
        formSendResult.textContent = '';

        // Получение данных из формы
        const formData = new FormData(form);
        const formDataObject = {};

        formData.forEach((value, key) => {
            formDataObject[key] = value.trim().replace(/\s+/g, ' ');
        });

        // Валидация полей на клиенте
        const validationErrors = validateForm(formDataObject);

        // Обновление интерфейса для отображения ошибок
        displayErrors(validationErrors);
        if (validationErrors.length > 0) return;

        // Отправка формы на бэк
        await sendFormData(form, formBtn, formSendResult, formDataObject);
    }


    function validateForm(formData) {
        const { name, email, message } = formData;

        const nameRegex = /^[А-Яа-яA-Za-z\-]+(\s[А-Яа-яA-Za-z\-]+)*$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const errors = [];

        if (!name) {
            errors.push({ field: 'name', message: 'Please enter your name.' });
        } else if (!nameRegex.test(name) || (name.length < 2 || name.length > 30)) {
            errors.push({ field: 'name', message: 'Please enter a valid name. Example: Sam Green.' });
        }

        if (!email) {
            errors.push({ field: 'email', message: 'Please enter your email address.' });
        } else if (!emailRegex.test(email) || (email.length < 5 || email.length > 100)) {
            errors.push({
                field: 'email',
                message: 'Please enter a valid email address. Example: example@example.com'
            });
        }

        if (!message) {
            errors.push({ field: 'message', message: 'Please enter a message.' });
        } else if (message.length < 20 || message.length > 400) {
            errors.push({ field: 'message', message: 'The message must contain from 20 to 400 characters.' });
        }

        return errors;
    }

    function displayErrors(errors) {
        // Скрытие всех ошибок перед отображением новых
        const errorElements = document.querySelectorAll('.form__error');
        errorElements.forEach((errorElement) => {
            errorElement.textContent = '';
        });

        if (errors.length < 1) return;

        // Отображение ошибок для соответствующих полей
        errors.forEach((error) => {
            const { field, message } = error;
            const errorElement = document.querySelector(`[data-for="${field}"]`);
            errorElement.textContent = message;
            errorElement.style.color = 'red';
        });
    }

    async function sendFormData(form, formBtn, formSendResult, formDataObject) {

        try {
            formBtn.value = 'Sending...';
            formBtn.disabled = true;

            const response = await fetch('http://34.118.0.154:5500/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formDataObject),
            });

            if (response.ok) {
                formSendResult.textContent = 'Thank you for your message! I will get in touch with you as soon as possible.';
                form.reset();
            } else if (response.status === 422) {
                const errors = await response.json();
                console.log(errors);
                throw new Error('Error while validating the entered data.');
            } else {
                throw new Error(response.statusText);
            }

        } catch (error) {
            console.error(error.message);
            formSendResult.textContent = 'Error sending message! Please try again or use the contacts below.';
            formSendResult.style.color = 'red';

        } finally {
            formBtn.value = 'Send';
            formBtn.disabled = false;
        }
    }
