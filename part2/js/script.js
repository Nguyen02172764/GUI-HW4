/*
File: script.js
GUI Assignment: HW4 - jQuery UI with Dynamic Multiplication Table
Name: Andrew Nguyen
Email: Andrew_Nguyen4@student.uml.edu
Description: Using jQuery Validation to validate the user's inputs, jQuery UI sliders to control 
same input values, and jQuery UI tabs to save multiple generated multiplication tables.
*/
$(function () {
    /*
    This variable keeps track of how many saved table tabs have been created.
    It helps create unique IDs for each new tab.
    */
    let tableTabCounter = 0;

    /*
    This array connects each text input to its matching slider.
    Using this structure avoids repeating the same slider setup four separate times.
    */
    const inputSliderPairs = [
        { input: "#minCol", slider: "#minColSlider" },
        { input: "#maxCol", slider: "#maxColSlider" },
        { input: "#minRow", slider: "#minRowSlider" },
        { input: "#maxRow", slider: "#maxRowSlider" }
    ];

    /*
    Turns the main tab area into a jQuery UI tabs widget.
    The first tab is used for the form and live table preview.
    */
    $("#tabs").tabs();

    /*
    Custom validation rule.
    This allows whole numbers that can be positive, negative, or zero.
    */
    $.validator.addMethod("wholeNumber", function (value, element) {
        return this.optional(element) || /^-?\d+$/.test(value);
    }, "Please enter a whole number.");

    /*
    Custom validation rule.
    This makes sure the minimum column value is not greater than the maximum column value.
    */
    $.validator.addMethod("validColumnRange", function () {
        return getInputNumber("#minCol") <= getInputNumber("#maxCol");
    }, "Minimum column value must be less than or equal to maximum column value.");

    /*
    Custom validation rule.
    This makes sure the minimum row value is not greater than the maximum row value.
    */
    $.validator.addMethod("validRowRange", function () {
        return getInputNumber("#minRow") <= getInputNumber("#maxRow");
    }, "Minimum row value must be less than or equal to maximum row value.");

    /*
    Sets up the jQuery Validation plugin.
    The form will not create a saved tab unless all rules pass.
    */
    $("#tableForm").validate({
        rules: {
            minCol: {
                required: true,
                wholeNumber: true,
                range: [-50, 50],
                validColumnRange: true
            },
            maxCol: {
                required: true,
                wholeNumber: true,
                range: [-50, 50],
                validColumnRange: true
            },
            minRow: {
                required: true,
                wholeNumber: true,
                range: [-50, 50],
                validRowRange: true
            },
            maxRow: {
                required: true,
                wholeNumber: true,
                range: [-50, 50],
                validRowRange: true
            }
        },

        messages: {
            minCol: {
                required: "Enter the starting column value.",
                wholeNumber: "The minimum column must be a whole number.",
                range: "The minimum column must be between -50 and 50.",
                validColumnRange: "Fix the column range: the minimum column cannot be greater than the maximum column."
            },
            maxCol: {
                required: "Enter the ending column value.",
                wholeNumber: "The maximum column must be a whole number.",
                range: "The maximum column must be between -50 and 50.",
                validColumnRange: "Fix the column range: the maximum column must be greater than or equal to the minimum column."
            },
            minRow: {
                required: "Enter the starting row value.",
                wholeNumber: "The minimum row must be a whole number.",
                range: "The minimum row must be between -50 and 50.",
                validRowRange: "Fix the row range: the minimum row cannot be greater than the maximum row."
            },
            maxRow: {
                required: "Enter the ending row value.",
                wholeNumber: "The maximum row must be a whole number.",
                range: "The maximum row must be between -50 and 50.",
                validRowRange: "Fix the row range: the maximum row must be greater than or equal to the minimum row."
            }
        },

        /*
        Places each error message directly under the input and slider that caused it.
        This makes the error location clear to the user.
        */
        errorPlacement: function (error, element) {
            const errorBox = "#" + element.attr("id") + "Error";
            error.appendTo(errorBox);
        },

        /*
        Runs only when all validation rules pass.
        Instead of reloading the page, the app saves the current table in a new tab.
        */
        submitHandler: function () {
            createSavedTableTab();
            return false;
        }
    });

    /*
    Creates the jQuery UI sliders and connects each slider to its matching input.
    Moving a slider changes the input value and updates the live preview.
    */
    inputSliderPairs.forEach(function (pair) {
        $(pair.slider).slider({
            min: -50,
            max: 50,
            value: getInputNumber(pair.input),

            slide: function (event, ui) {
                $(pair.input).val(ui.value);
                updateLiveTable();
            },

            change: function (event, ui) {
                $(pair.input).val(ui.value);
                updateLiveTable();
            }
        });
    });

    /*
    Updates the slider when the user types directly into an input box.
    This is the other half of the two-way binding requirement.
    */
    $("#tableForm input").on("input", function () {
        const currentInput = "#" + $(this).attr("id");
        const matchingPair = inputSliderPairs.find(function (pair) {
            return pair.input === currentInput;
        });

        if (matchingPair && isWholeNumberInRange($(this).val())) {
            $(matchingPair.slider).slider("value", Number($(this).val()));
        }

        updateLiveTable();
    });

    /*
    Deletes all saved table tabs that have their checkbox selected.
    This fulfills the multiple-tab deletion requirement.
    */
    $("#deleteSelectedTabs").on("click", function () {
        $(".tab-select:checked").each(function () {
            const panelId = $(this).data("panel");
            removeSavedTab(panelId);
        });

        $("#tabs").tabs("refresh");
        $("#tabs").tabs("option", "active", 0);
    });

    /*
    Creates the first live preview table when the page loads.
    */
    updateLiveTable();

    /*
    Reads a number from an input field.
    */
    function getInputNumber(selector) {
        return Number($(selector).val());
    }

    /*
    Checks whether a typed value is a whole number inside the assignment range.
    This prevents the slider from trying to use invalid values.
    */
    function isWholeNumberInRange(value) {
        return /^-?\d+$/.test(value) && Number(value) >= -50 && Number(value) <= 50;
    }

    /*
    Collects all four form values into one object.
    This makes table generation cleaner.
    */
    function collectValues() {
        return {
            minCol: getInputNumber("#minCol"),
            maxCol: getInputNumber("#maxCol"),
            minRow: getInputNumber("#minRow"),
            maxRow: getInputNumber("#maxRow")
        };
    }

    /*
    Updates the live preview table if the form is currently valid.
    If the form has an error, the preview is cleared to avoid showing incorrect results.
    */
    function updateLiveTable() {
        if ($("#tableForm").valid()) {
            const values = collectValues();
            $("#tableContainer").html(buildTable(values));
        } else {
            $("#tableContainer").empty();
        }
    }

    /*
    Creates a new tab containing a saved multiplication table.
    The tab label includes the range values used to generate that table.
    */
    function createSavedTableTab() {
        const values = collectValues();
        const panelId = "savedTable" + tableTabCounter;
        const tabLabel = "C " + values.minCol + " to " + values.maxCol +
                         " / R " + values.minRow + " to " + values.maxRow;

        tableTabCounter++;

        /*
        Adds the clickable tab label.
        The checkbox allows this tab to be selected for multiple deletion.
        */
        $("#tabs > ul").append(
            "<li id='label-" + panelId + "'>" +
                "<input type='checkbox' class='tab-select' data-panel='" + panelId + "'>" +
                "<a href='#" + panelId + "'>" + tabLabel + "</a>" +
            "</li>"
        );

        /*
        Adds the tab content area.
        Each saved tab includes a delete button for individual deletion.
        */
        $("#tabs").append(
            "<section id='" + panelId + "' class='saved-table-panel'>" +
                "<button type='button' class='delete-this-tab' data-panel='" + panelId + "'>" +
                    "Delete This Tab" +
                "</button>" +
                "<div class='saved-table-box'>" + buildTable(values) + "</div>" +
            "</section>"
        );

        /*
        Refreshes the tab widget so jQuery UI recognizes the new tab.
        Then it opens the newly created tab.
        */
        $("#tabs").tabs("refresh");
        $("#tabs").tabs("option", "active", tableTabCounter);

        /*
        Connects the individual delete button inside this new tab.
        */
        $("#" + panelId + " .delete-this-tab").on("click", function () {
            removeSavedTab($(this).data("panel"));
            $("#tabs").tabs("refresh");
            $("#tabs").tabs("option", "active", 0);
        });
    }

    /*
    Removes the saved tab label and matching tab panel.
    */
    function removeSavedTab(panelId) {
        $("#label-" + panelId).remove();
        $("#" + panelId).remove();
    }

    /*
    Builds a multiplication table as an HTML string.
    The top row and first column become table headers.
    */
    function buildTable(values) {
        let tableHtml = "<table>";

        tableHtml += "<thead><tr><th></th>";

        for (let col = values.minCol; col <= values.maxCol; col++) {
            tableHtml += "<th>" + col + "</th>";
        }

        tableHtml += "</tr></thead><tbody>";

        for (let row = values.minRow; row <= values.maxRow; row++) {
            tableHtml += "<tr>";
            tableHtml += "<th>" + row + "</th>";

            for (let col = values.minCol; col <= values.maxCol; col++) {
                tableHtml += "<td>" + (row * col) + "</td>";
            }

            tableHtml += "</tr>";
        }

        tableHtml += "</tbody></table>";

        return tableHtml;
    }
});
