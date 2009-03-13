<div class="paper">
    <img src="chrome://viviecr/content/skin/images/logo.png" />
    <br />

    <p align="left">${head.store.name}</p>
	<p align="left">${head.store.branch}</p>
	<p align="left">${head.store.telephone1}</p>
	<p align="left">Terminal: ${head.store.terminal_no}</p>
	<p align="left">Clerk: ${head.clerk_displayname}</p>
	<p align="right">Printed Time: ${foot.gen_time}</p>
	<p align="right">${head.start_time} - ${head.end_time}</p>

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
</div>
<br />
