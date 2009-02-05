<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
{for master in body}
        <table id="body-table">
            <caption>${master.starttime} - ${master.endtime}</caption>
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
                    <td>${detail.amount}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td style="text-align: left;">Clerk: ${master.clerk}</td>
                    <td>Total: ${master.amount}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
