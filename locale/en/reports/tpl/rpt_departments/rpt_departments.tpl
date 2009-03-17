<div class="paper" style="overflow:auto;" >
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
<!-- div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" -->

<p align="left">${head.store.name}</p>
<p align="left">${head.store.branch}</p>
<p align="left">${head.store.telephone1}</p>
<p align="left">Terminal: ${head.store.terminal_no}</p>
<p align="left">Clerk: ${head.clerk_displayname}</p>
<p align="right">Printed Time: ${foot.gen_time}</p>

        <table id="body-table">
            <caption>${head.title}</caption>
            <thead>
                <tr>
                    <th style="text-align: left;">No</th>
                    <th style="text-align: left;">Name</th>
                </tr>
            </thead>
            <tbody>
{for category in body}
                <tr>
                    <td style="text-align: left;">${category.no}</td>
                    <td style="text-align: left;">${category.name}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                <td colspan="2"><td></td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
