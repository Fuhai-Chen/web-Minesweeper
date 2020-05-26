var jms = null,
    timeHandle = null;
window.onload = function () {
    var radios = document.getElementsByName("level");

    for (var i = 0, j = radios.length; i < j; i ++){
        radios[i].onclick = function () {
            // jms不为空，已开始游戏
            if (jms != null)
                // 剩余地雷数大于0，雷没排完
                if (jms.landMineCount > 0)
                    if (!confirm("确认结束当前游戏？")) return false;

            var value = this.value;
            init(value,value,(value * value) / 5 - value, (value * value) / 5);
            document.getElementById("JMS_main").style.width = value * 40 + 180 + 60 + "px";
        };
    }
    init(10,10);
}


//init 函数定义
function init(rowCount,colCount,minLandMineCount,maxLandMineCount) {
    var doc = document,
        landMineCountElement = doc.getElementById("landMineCount"),
        timeshow = doc.getElementById("costTime"),
        beginButton = doc.getElementById("begin");
    if (jms != null){
        clearInterval(timeHandle);
        timeshow.innerHTML = 0;
        landMineCountElement.innerHTML = 0;

    }
    // 调用JMS函数，返回值赋jms （见顶，初始化null）
    jms = JMS("landmine",rowCount,colCount,minLandMineCount,maxLandMineCount);

}



