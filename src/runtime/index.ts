import {
    TWWidgetDefinition,
    property,
    canBind,
    didBind,
    TWEvent,
    event,
    service,
    TWService,
} from 'typescriptwebpacksupport/widgetRuntimeSupport';

import * as QRCode from 'qrcodejs';
import * as printJS from 'print-js';

const tableDivBaseID = 'tableDiv-';
const qrCodeDivBaseID = 'qrcodeDiv-';

/**
 * The `@TWWidgetDefinition` decorator marks a class as a Thingworx widget. It can only be applied to classes
 * that inherit from the `TWRuntimeWidget` class.
 */
@TWWidgetDefinition
class QrCodePrinterWebpack extends TWRuntimeWidget {

    /**
     * Invoked to obtain the HTML structure corresponding to the widget.
     * @return      The HTML structure.
     */
    renderHtml(): string {
        return (
            '<div class="widget-content widget-qrcodeprinterwidget" style="display: none;">' +
            '<div id="contentToPrint"></div>' +
            '</div>'
        );
    }

    @service print(): void {
        this.populateDiv();
        printJS({
            printable: "contentToPrint",
            type: "html",
            documentTitle: "Print Document"
        });
    }

    afterRender(): void {
        console.log('webpack widger rendered correclty.');
    }

    /**
     * Invoked when this widget is destroyed. This method should be used to clean up any resources created by the widget
     * that cannot be reclaimed by the garbage collector automatically (e.g. HTML elements added to the page outside of the widget's HTML element)
     */
    beforeDestroy?(): void {
        // add disposing logic
    }


    populateDiv(): void {
        TW.log.info('About to update divs to print');
        console.log('About to update divs to print')
        let contentToPrint = document.getElementById('contentToPrint');
        this.clearData(contentToPrint);
        const allData = this.getProperty('DataToPrint')
        console.log('Retrieved data from property DataToPrint: ');
        console.log(allData);
        for (let i = 0; i < allData.length; i++) {
            // Creating row div that holds all data relevant to one qr code
            let div = document.createElement('div');
            div.style.display = "flex"
            contentToPrint.appendChild(div);

            // Creating table div that holds information relevant to qr code
            let tableDiv = document.createElement('div');
            tableDiv.id = tableDivBaseID + i;
            tableDiv.style.display = "inline-block";
            console.log('About to create table to with information');
            this.populateTable(tableDiv, allData[i])
            div.appendChild(tableDiv);
            console.log('Table created');

            // Creating spacer div we need it to ensure proper spacing when printing
            let spacerDiv = document.createElement('div');
            spacerDiv.style.display = 'inline-block';
            spacerDiv.style.width = '20px';
            div.appendChild(spacerDiv);

            // creating qrCode hodler div
            let qrcodeDiv = document.createElement('div');
            qrcodeDiv.id = qrCodeDivBaseID + i;
            qrcodeDiv.style.display = "inline-block";
            div.appendChild(qrcodeDiv);
            console.log('About to generate qr code');
            this.generateQRCode(i, allData[i].code);
            console.log('qr code created');
        }
    };

    clearData(divToClear): void {
        while (divToClear.firstChild) {
            divToClear.removeChild(divToClear.firstChild);
        }
    };

    populateTable(tableDiv, associatedData): void {
        let table = document.createElement('table');
        table.classList.add('myTable');
        this.createRow(table, 'th', { 'name': 'Property', 'value': 'Value' });
        for (let i = 0; i < associatedData.info.rows.length; i++) {
            this.createRow(table, 'td', associatedData.info.rows[i]);
        }
        tableDiv.appendChild(table);
    };

    createRow(table, rowType, row): void {
        let newRow = document.createElement('tr');
        newRow.classList.add('myTable');

        let property = document.createElement(rowType);
        property.classList.add('myTable');
        property.appendChild(
            document.createTextNode(row.name));

        let value = document.createElement(rowType);
        value.classList.add('myTable');
        value.appendChild(
            document.createTextNode(row.value));

        newRow.appendChild(property);
        newRow.appendChild(value);
        table.appendChild(newRow);
    };

    generateQRCode(index, code): void {
        let divId = qrCodeDivBaseID + index;
        let config = {
            'width': this.getProperty("CodeSize"),
            'height': this.getProperty("CodeSize"),
            'colorDark': "#000000",
            'colorLight': "#ffffff",
            'correctLevel': this.getProperty("Redundancy") // Error correction level
        };
        try {
            let generatedCode = new QRCode(divId, config);
            try {
                generatedCode.makeCode(code);
            } catch (e) {
                console.log('Error generating qr code: ' + e);
            }
        } catch (e) {
            console.log('Error in setup qr code: ' + e);
        }
    };
}
