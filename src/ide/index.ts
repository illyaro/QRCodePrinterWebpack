// automatically import the css file
import './ide.css';
import {
    TWWidgetDefinition,
    autoResizable,
    description,
    property,
    defaultValue,
    bindingTarget,
    service,
    event,
    bindingSource,
    nonEditable,
    willSet,
    didSet,
    displayName,
    selectOptions,
    baseTypeInfotableProperty,
} from 'typescriptwebpacksupport/widgetIDESupport';

import widgetIconUrl from '../images/icon.ide.png';
import ideIcon from '../images/printer.png';

/**
 * The `@TWWidgetDefinition` decorator marks a class as a Thingworx widget. It can only be applied to classes
 * that inherit from the `TWComposerWidget` class. It must receive the display name of the widget as its first parameter.
 * Afterwards any number of widget aspects may be specified.
 *
 * Because of this, the `widgetProperties` method is now optional. If overriden, you must invoke the superclass
 * implementation to ensure that decorated aspects are initialized correctly.
 */
@description('A widget that Prints QR code using Printjs library')
@TWWidgetDefinition('QrCodePrinterWebpack', autoResizable)
class QrCodePrinterWebpack extends TWComposerWidget {

    /**
    * Invoked to obtain the URL to this widget's icon.
    * @return  The URL.
    */
    widgetIconUrl(): string {
        return widgetIconUrl;
    }

    @property('NUMBER', defaultValue(200))
    width: number;

    @property('NUMBER', defaultValue(120))
    height: number;

    @description('The size of resultiong QR code')
    @property('NUMBER', bindingTarget, defaultValue(150))
    codeSize: number;

    @description('This value can enable generation of qr code')
    @property('BOOLEAN', bindingTarget, defaultValue(true))
    EnableQRCodeGeneration: boolean;

    @property('STRING', 
        defaultValue('L'), 
        selectOptions([
            { text: '7 %', value: 'L' },  // 'QRCode.CorrectLevel.L'
			{ text: '15 %', value: 'M' }, // 'QRCode.CorrectLevel.M'
			{ text: '25 %', value: 'Q' }, // 'QRCode.CorrectLevel.Q'
			{ text: '30 %', value: 'H' }  // 'QRCode.CorrectLevel.H'
        ]))
    Redundancy: number;

    @description('Data to be printed next to QR code. Must contain 2 fields in its datashape: {"name", "value"}')
    @property('INFOTABLE', bindingTarget, defaultValue({}))
    DataToPrint: object;

    /**
     * Invoked to obtain the HTML structure corresponding to the widget.
     * @return      The HTML structure.
     */
    renderHtml(): string {
        return (
            `<div class="widget-content widget-qrcodeprinterwidget" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">` +
                `<p>Printer Widget</p>` +
                `<img src="${ideIcon}" alt="Printer Logo" style="max-width: 50px; height: auto;">` +
                `<p>Invisible at runtime</p>` +
            `</div>`
        );
    }

    @description('Invoke function to print desired part of the HTML DOM')
    @service
    print;

    afterRender(): void {
        // no after-render logic needed
    }

    beforeDestroy(): void {
        // no dispose logic needed at design-time
    }
}
