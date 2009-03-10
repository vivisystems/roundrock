<div class="paper">
    <img src="chrome://viviecr/content/skin/images/logo.png" />
    <br />
    
    <p align="left">${head.store.name}</p>
	<p align="left">${head.store.branch}</p>
	<p align="left">${head.store.telephone1}</p>
	<p align="left">機器編號: ${head.store.terminal_no}</p>
	<p align="left">櫃員: ${head.clerk_displayname}</p>
	<p align="right">列印時間: ${foot.gen_time}</p>
	<p align="right">${head.start_time} - ${head.end_time}</p>

    <table id="body-table">
        <caption>${head.title}</caption>
        <thead>
            <tr>
                <th style="text-align: right;">櫃員</th>
                <th style="text-align: right;">事件</th>
                <th style="text-align: right;">次數</th>
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
                <td colspan="2">總計:</td>
                <td>${foot.foot_data.total_num_events}</td>
            </tr>
        </tfoot>
    </table>
    <br />
</div>
<br />
