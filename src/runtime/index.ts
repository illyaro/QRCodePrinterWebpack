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

const QRCode = require('qrcode');
import * as printJS from 'print-js';

const tableDivBaseID = 'tableDiv-';
const qrCodeDivBaseID = 'qrcodeDiv-';

type MyObject = {
    name: string;
    value: string;
};

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

    @property(canBind('DataToPrintCanBind')) set DataToPrint(value: object) {
        console.log('call populate div from inside the canBind');
        //this.populateDiv();
    }
     
    @property('DataToPrint')
    data_to_print: object;

    DataToPrintCanBind(value: object, info: TWUpdatePropertyInfo): boolean {
        console.log(`Value DataToPrint will be updated to ${value}`);
        // this.setProperty('EnableQRCodeGeneration', value);
        return true;
    }


    @service print(): void {
        this.populateDiv();
        printJS({
            printable: "contentToPrint",
            type: "html",
            documentTitle: "Print Document"
        });
    }

    @property(canBind('EnableQRCodeGenerationProp')) set EnableQRCodeGeneration(value: boolean) {
        console.log('call EnableQRCodeGenerationProp from inside the canBind');
    }

    @property('EnableQRCodeGeneration')
    Enable_QR_Code_Generation: boolean;
 
    EnableQRCodeGenerationProp(value: boolean, info: TWUpdatePropertyInfo): boolean {
        console.log(`Value Enable qr code will be updated to ${value}`);
        // this.setProperty('EnableQRCodeGeneration', value);
        return true;
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
        let contentToPrint = document.getElementById('contentToPrint');
        this.clearData(contentToPrint);
        const allData = this.getProperty('DataToPrint')
        for (let i = 0; i < allData.rows.length; i++) {
            // Creating row div that holds all data relevant to one qr code
            let div = document.createElement('div');
            div.style.display = "flex"
            contentToPrint.appendChild(div);

            // Creating table div that holds information relevant to qr code
            let tableDiv = document.createElement('div');
            tableDiv.id = tableDivBaseID + i;
            tableDiv.style.display = "inline-block";
            this.populateTable(tableDiv, allData.rows[i])
            div.appendChild(tableDiv);
            console.log("Is enabled printing: " + this.getProperty('EnableQRCodeGeneration'));
            if(this.getProperty('EnableQRCodeGeneration')){
                // Creating spacer div we need it to ensure proper spacing when printing
                let spacerDiv = document.createElement('div');
                spacerDiv.style.display = 'inline-block';
                spacerDiv.style.width = '20px';
                div.appendChild(spacerDiv);

                // creating qrCode hodler div
                let qrcodeDiv = document.createElement('div');
                let divId = qrCodeDivBaseID + i;
                qrcodeDiv.id = divId;
                qrcodeDiv.style.display = "inline-block";
                div.appendChild(qrcodeDiv);
                this.generateQRCode(qrcodeDiv, allData.rows[i].code);
            }
        }
    };

    clearData(divToClear:HTMLElement): void {
        while (divToClear.firstChild) {
            divToClear.removeChild(divToClear.firstChild);
        }
    };

    populateTable(tableDiv: HTMLDivElement, associatedData): void {
        let table = document.createElement('table');
        table.classList.add('myTable');
        this.createRow(table, 'th', { 'name': 'Property', 'value': 'Value' });
        for (let i = 0; i < associatedData.info.rows.length; i++) {
            this.createRow(table, 'td', associatedData.info.rows[i]);
        }
        tableDiv.appendChild(table);
    };

    createRow(table: HTMLTableElement, rowType: string, row: MyObject): void {
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

    generateQRCode(div: HTMLDivElement, code: string): void {
        let config = {
            'width': this.getProperty("codeSize"),
            'errorCorrectionLevel': this.getProperty("Redundancy") // Error correction level
        };
        try {
            QRCode.toCanvas(code, config, function (error, canvas) {
                if (error) {
                    throw error;
                }
                TW.log.info('QR code generated and inserted into the div.');
                div.appendChild(canvas);

            });
        } catch (e) {
            console.log('Error in setup qr code: ' + e);
        }
    };
}
