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
<p align="right">${head.start_time} - ${head.end_time}</p>

        <table id="body-table">
            <caption>${head.title}</caption>
            <thead>
                <tr>
                    <th>Term_No.</th>
                    <th>Time</th>
                    <th>Total</th>
                    <th>Orders</th>
                    <th>Guests</th>
                    <th>Items</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">{if head.machine_id} ${detail.terminal_no} {/if}</td>
                    <td style="text-align: left;">${detail.Hour}</td>
                    <td>${detail.HourTotal}</td>
                    <td>${detail.OrderNum}</td>
                    <td>${detail.Guests}</td>
                    <td>${detail.ItemsCount}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td>Total:</td>
                    <td>${foot.HourTotal}</td>
                    <td>${foot.OrderNum}</td>
                    <td>${foot.Guests}</td>
                    <td>${foot.ItemsCount}</td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
