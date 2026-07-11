document.addEventListener("DOMContentLoaded", function () {
	const root = document.getElementById("root")

	if (window.FlightsSearchWidget && root) {
		FlightsSearchWidget.init({
			webskyURL: "http://demo.websky.aero/gru",
			nemoURL: "https://travel.payoplata.ru",
			rootElement: root,
			locale: "ru",
		})
	}

	if (!root) return

	root.dataset.ppTrip = "oneway"

	function setTripMode(mode) {
		root.dataset.ppTrip = mode

		const activeComplexSwitch = root.querySelector(
			".widget__routeTypeSwitch_toOW span",
		)
		if (activeComplexSwitch && mode !== "complex") {
			activeComplexSwitch.click()
		}

		if (mode === "round") {
			const dateFields = root.querySelectorAll(".widget-dates__col")
			const returnInput = dateFields[1]?.querySelector(".widget-ui-input")
			if (returnInput) {
				returnInput.click()
			}
		}
	}

	function syncStartButtonLabel() {
		root.querySelectorAll(".widget__startButton.btn-primary").forEach(
			function (button) {
				if (button.textContent.trim() !== "Искать") {
					button.textContent = "Искать"
				}
			},
		)
	}

	function hideNoReturnButton() {
		root.querySelectorAll(
			"button, .widget-ui-datepicker__footer__button",
		).forEach(function (button) {
			const text = button.textContent.trim().toLowerCase()
			if (text.includes("обратный билет не нужен")) {
				button.style.display = "none"
			}
		})
	}

	function installTripSwitch() {
		const widget = root.querySelector(".widget")
		if (!widget) return

		root.dataset.ppComplex = widget.classList.contains("widget_CR")
			? "true"
			: "false"

		if (root.querySelector(".pp-flight-mode-switch")) {
			return
		}

		const switcher = document.createElement("div")
		switcher.className = "pp-flight-mode-switch"

		const round = document.createElement("button")
		round.type = "button"
		round.dataset.mode = "round"
		round.textContent = "В обе стороны"
		round.addEventListener("click", function () {
			setTripMode("round")
		})

		const oneWay = document.createElement("button")
		oneWay.type = "button"
		oneWay.dataset.mode = "oneway"
		oneWay.textContent = "В одну сторону"
		oneWay.addEventListener("click", function () {
			setTripMode("oneway")
		})

		switcher.append(oneWay, round)
		root.insertBefore(switcher, widget)
	}

	root.addEventListener(
		"click",
		function (event) {
			const closer = event.target.closest(
				".widget-dates__col:nth-child(2) .widget-ui-input__closer",
			)
			const widget = root.querySelector(".widget")
			if (closer && widget && !widget.classList.contains("widget_CR")) {
				window.setTimeout(function () {
					setTripMode("oneway")
				}, 0)
			}
		},
		true,
	)

	installTripSwitch()
	syncStartButtonLabel()
	hideNoReturnButton()

	new MutationObserver(function () {
		installTripSwitch()
		syncStartButtonLabel()
		hideNoReturnButton()
	}).observe(root, {
		childList: true,
		subtree: true,
	})
})
