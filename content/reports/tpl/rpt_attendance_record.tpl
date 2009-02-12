<div class="paper" style="overflow:auto;">
<!-- div id="printhead" -->
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
<p>${head.title}</p>
<!-- /div>
<div id="docbody" -->
{for master in body}
        <table id="body-table">
            <caption>${master.username} - {master.displayname}</caption>
            <thead>
                <tr>
                    <th style="text-align: left;">Job</th>
                    <th style="text-align: left;">Clock In</th>
                    <th style="text-align: left;">Clock Out</th>
                </tr>
            </thead>
            <tbody>
{for stamp in master.clockStamps}
                <tr>
                    <td style="text-align: left;">${stamp.job}</td>
                    <td style="text-align: left;">${stamp.InTime}</td>
                    <td style="text-align: left;">${stamp.OutTime}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3"></td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
