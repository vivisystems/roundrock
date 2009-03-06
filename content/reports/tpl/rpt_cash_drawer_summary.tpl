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
                <td>${foot.foot_data.total_num_events}</td>
            </tr>
        </tfoot>
    </table>
    <br />
</div>
<br />
