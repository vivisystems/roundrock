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
                <th style="text-align: left;">Terminal No.</th>
                <th style="text-align: left;">Drawer No.</th>
                <th style="text-align: right;">Clerk</th>
                <th style="text-align: right;">Time</th>
                <th style="text-align: right;">Event</th>
            </tr>
        </thead>
        <tbody>
{for item in body}
            <tr>
                <td style="text-align: left;">${item.terminal_no}</td>
                <td style="text-align: left;">${item.drawer_no}</td>
                <td>${item.clerk_displayname}</td>
                <td>${item.created}</td>
                <td>${item.event_type}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5"></td>
            </tr>
        </tfoot>
    </table>
    <br />
    Printed:${printedtime}
</div>
<br />
