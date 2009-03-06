<div class="paper" style="overflow:auto;">
<!-- div id="printhead" -->
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />

<p align="left">${head.store.name}</p>
<p align="left">${head.store.branch}</p>
<p align="left">${head.store.telephone1}</p>
<p align="left">Terminal: ${head.store.terminal_no}</p>
<p align="left">Clerk: ${head.clerk_displayname}</p>
<p align="right">Printed Time: ${foot.gen_time}</p>
<p align="right">${head.start_time}-${head.end_time}</p>

<p>${head.title}</p>

<!-- /div>
<div id="docbody" -->
{for master in body}
        <table id="body-table">
            <caption>${master.username}</caption>
            <thead>
                <tr>
                    <th style="text-align: left;">Job</th>
                    <th style="text-align: left;">Clock In</th>
                    <th style="text-align: left;">Clock Out</th>
                    <th style="text-align: left;">Span Time</th>
                </tr>
            </thead>
            <tbody>
{for stamp in master.clockStamps}
                <tr>
                    <td style="text-align: left;">${stamp.job}</td>
                    <td style="text-align: left;">${stamp.InTime}</td>
                    <td style="text-align: left;">${stamp.OutTime}</td>
                    <td style="text-align: left;">${stamp.SpanTime}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3">Summary:</td>
                    <td>${master.total_spantime}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
