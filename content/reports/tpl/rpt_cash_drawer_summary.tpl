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
    </table>

    <table id="body-table">
        <caption>${head.title}</caption>
        <thead>
            <tr>
                <th style="text-align: right;">Clerk</th>
                <th style="text-align: right;">Event</th>
                <th style="text-align: right;">Number of Events</th>
            </tr>
        </thead>
        <tbody>
{for item in body}
            <tr>
                <td>${item.clerk_displayname}</td>
                <td>${item.event_type}</td>
                <td>${item.num_events}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2">Summary:</td>
                <td>${foot.total_num_events}</td>
            </tr>
        </tfoot>
    </table>
    <br />
    Printed:${printedtime}
</div>
<br />
