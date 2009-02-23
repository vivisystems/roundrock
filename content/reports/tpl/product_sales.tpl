<div class="paper">
    <img src="chrome://viviecr/content/skin/images/logo.png" />
    <br />

    <table>
        <tr>
            <td>
            Start:
            </td>
            <td>
            ${head.start_date}
            </td>
        </tr>
        <tr>
            <td>
            End:
            </td>
            <td>
            ${head.end_date}
            </td>
        </tr>
        <!-- html:tr>
            <td>
            Department:
            </td>
            <td>
            ${head.department}
            </td>
        </tr -->
        <tr>
            <td>
            Machine Id:
            </td>
            <td>
            ${head.machine_id}
            </td>
        </tr>
    </table>

    <table id="body-table">
        <caption>${head.title}</caption>
        <thead>
            <tr>
                <th>No</th>
                <th>Name</th>
                <th>Qty</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
{for item in body}
            <tr>
                <td style="text-align: left;">${item.product_no}</td>
                <td style="text-align: left;">${item.product_name}</td>
                <td>${item.qty}</td>
                <td>${item.total}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2">Summary:</td>
                <td>${foot.qty}</td>
                <td>${foot.summary}</td>
            </tr>
        </tfoot>
    </table>
    <br />
    Printed:${printedtime}
</div>
<br />
