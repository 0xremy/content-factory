const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEXTS = [
    "**THE PUPPET MASTER: Justin Sun & WLFI**\n\n(EN) WLFI isn't just tech; it's Justin Sun's masterstroke. Who's pulling the strings? Hint: it's not about the tech. #JustinSun #WLFI\n\n(VI) WLFI không chỉ là công nghệ; đó là nước đi bậc thầy của Justin Sun. Ai đang giật dây? Gợi ý: không phải về tech. #JustinSun #WLFI",
    "(EN) Sun doesn't just invest; he captures attention. This is a bridge between US political power & global liquidity. #StrategicInsight\n\n(VI) Sun không chỉ đầu tư; anh ta thu hút sự chú ý. Đây là cầu nối giữa quyền lực chính trị Mỹ & thanh khoản toàn cầu. #StrategicInsight",
    "(EN) Why Trump? Strategic genius. Aligning with a polarizing figure opens doors to influence. It's a political power play. #GameChanger\n\n(VI) Tại sao là Trump? Thiên tài chiến lược. Gắn kết với một nhân vật gây tranh cãi mở ra cánh cửa quyền lực. #GameChanger",
    "(EN) The real game is shaping narratives. Sun is the ultimate 'Narrative Merchant' in both crypto & political arenas. #StrategicMoves\n\n(VI) Cuộc chơi thực sự là định hình narrative. Sun là 'Thương nhân Narrative' tối thượng trong cả crypto & chính trị. #StrategicMoves",
    "(EN) Perception is reality. Sun has intertwined these worlds. Are you ready to see beyond the tech into the theater of influence? #ThinkBeyond\n\n(VI) Nhận thức là thực tại. Sun đã đan xen hai thế giới này. Bạn đã sẵn sàng nhìn xuyên qua tech để thấy sân khấu quyền lực? #ThinkBeyond"
];

const SCRIPT_PATH = "/home/profesor/.openclaw/workspace/skills/x-api/scripts/x-post.mjs";

async function publish() {
    let lastId = "";
    for (let i = 0; i < TEXTS.length; i++) {
        console.log(`Posting tweet ${i + 1}...`);
        try {
            const cmd = lastId 
                ? `node ${SCRIPT_PATH} "${TEXTS[i].replace(/"/g, '\\"')}" ${lastId}`
                : `node ${SCRIPT_PATH} "${TEXTS[i].replace(/"/g, '\\"')}"`;
            
            const result = execSync(cmd, { encoding: 'utf8' });
            console.log(`Tweet ${i + 1} Result: ${result}`);
            
            // Extract ID from JSON result
            const match = result.match(/"id":"([^"]+)"/);
            if (match) {
                lastId = match[1];
            } else {
                console.error(`Could not extract ID for tweet ${i + 1}`);
            }
        } catch (error) {
            console.error(`Error posting tweet ${i + 1}: ${error.message}`);
            process.exit(1);
        }
    }
    console.log("All tweets published successfully!");
}

publish();
