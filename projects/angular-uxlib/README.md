# About
This Angular 9 library contains the tgt-uxlib module and is used to automatically enable resizable HTML table columns.

(NOTE: This component uses ShadowDom view encapsulation and may affect some aspects of your table)

# Usage

Simply surround your html table with the custom selector.

    <tgt-uxlib-table>
        <table>
            <thead>
            <th>Header1</th>
            <th>Header2</th>
            </thead>
            <tbody>
                <tr>
                    <td>cell1</td>
                    <td>cell2</td>
                </tr>
            </tbody>
        </table>
    </tgt-uxlib-table>


Although I take into account cell padding and border width style, please limit any other styling that could alter the calculated dimensions of a cell or header.

# Updates
Added vertical sizing for the resize handles to the refreshHandles function. This will allow for better handle sizing for dynamic table data.
When the last row is loaded, you can call refreshHandles to update handle sizes and locations.

# TgtUxlib
I will be adding more custom UI components, but as of this version, I'm only supporting resizable table columns.

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.12.

