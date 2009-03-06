<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
<p align="left">${head.store.name}</p>
<p align="left">${head.store.branch}</p>
<p align="left">${head.store.telephone1}</p>
<p align="left">Terminal: ${head.store.terminal_no}</p>
<p align="left">Clerk: ${head.clerk_displayname}</p>
<p align="right">Printed Time: ${foot.gen_time}</p>
<p align="right">${head.start_time} - ${head.end_time}</p>

{for master in body}
        <table id="body-table">
            <caption>${master.terminal_no} : ${master.starttime} - ${master.endtime}</caption>
            <thead>
                <tr>
                    <th>Topic</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
{for detail in master.ShiftChangeDetail}
                <tr>
                    <td style="text-align: left;">${detail.topic}</td>
                    <td>${detail.amount|default:0|viviFormatPrices:true}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td style="text-align: left;">Clerk: ${master.clerk}</td>
                    <td>Total: ${master.amount|default:0|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
