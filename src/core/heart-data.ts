import { Context } from 'koishi'

// 心法数据接口
export interface HeartMethod {
  code: string
  text: string
  file: string
}

// 心法数据（直接嵌入避免编码问题）
export const HEART_METHODS: HeartMethod[] = [
  {code: 'M01', text: '谋定而后动。', file: 'M01.mp3'},
  {code: 'M02', text: '顺大势，逆小势', file: 'M02.mp3'},
  {code: 'M03A', text: '上联风吹哪页读哪页，下联是哪页难读撕哪页，横批是什么？去你大爷', file: 'M03A.mp3'},
  {code: 'M03B', text: '风吹哪页读哪页，记住，一切都是最好安排', file: 'M03B.mp3'},
  {code: 'M04', text: '你越想找好的，你越是接盘', file: 'M04.mp3'},
  {code: 'M05', text: '就是想赚大钱都是逆人性的', file: 'M05.mp3'},
  {code: 'M06', text: '一定要学会屏蔽掉这些噪音，同时建立自己的一个非常良好的心态', file: 'M06.mp3'},
  {code: 'M07', text: '当你觉得舒服的时候，恰恰是风险最大的时刻', file: 'M07.mp3'},
  {code: 'M08', text: '投资就是反人性的，就是你要学会守株待兔', file: 'M08.mp3'},
  {code: 'M09', text: '365 天看懂哪天做哪天', file: 'M09.mp3'},
  {code: 'M10', text: '所有挣钱的过程，等待的时间都是很煎熬的', file: 'M10.mp3'},
  {code: 'M11', text: '不追、不动、不慌、不乱摸', file: 'M11.mp3'},
  {code: 'M12', text: '股市里边赚的是什么钱？大富翁赚的什么钱？就是熬人的钱', file: 'M12.mp3'},
  {code: 'M13A', text: '曼城阵容拿住不动', file: 'M13A.mp3'},
  {code: 'M14', text: '赚了钱了拿出来消费', file: 'M14.mp3'},
  {code: 'M15', text: '与国家同在，只输时间不输钱。', file: 'M15.mp3'},
  {code: 'M16', text: '市场没有证明你是对的时候，你就是错了', file: 'M16.mp3'},
  {code: 'M17', text: '在这个市场里边，你不亏钱才叫赚钱，而不是不赚钱叫亏', file: 'M17.mp3'},
  {code: 'M18', text: '早上涨晚上涨早晚上涨,早下跌晚下跌早晚下跌', file: 'M18.mp3'},
  {code: 'M19', text: '现在赚钱还是以后赚大钱', file: 'M19.mp3'},
  {code: 'M20', text: '只有成功才是成功他妈', file: 'M20.mp3'},
  {code: 'M21', text: '永远不要对你期待的事情抱有不切实际的幻想', file: 'M21.mp3'},
  {code: 'M22B', text: '王德峰教授说过，如果一个男人过了四十岁还不相信有命的话，此人悟性极差', file: 'M22B.mp3'},
  {code: 'M23', text: '一定要放飞，把钱揣兜里', file: 'M23.mp3'},
  {code: 'M24A', text: '大 A 踏不了空、扽起来就卖！', file: 'M24A.mp3'},
  {code: 'M25', text: '不用害怕，怕你就会输一辈子', file: 'M25.mp3'},
  {code: 'M26', text: '一派胡言啊', file: 'M26.mp3'},
  {code: 'M27', text: '在这个世界上啊，该是你的绝逼是你的', file: 'M27.mp3'},
  {code: 'M28C', text: '踏踏实实的，别着急啊', file: 'M28C.mp3'},
  {code: 'M29', text: '你怎么认知慢就是快，这两个最重要的就是什么，什么时候慢，什么时候快', file: 'M29.mp3'},
  {code: 'M30', text: '能听懂就听，听不懂就反复听', file: 'M30.mp3'},
  {code: 'M31', text: '只选最美，只买最强，只拿最硬。', file: 'M31.mp3'},
  {code: 'M32', text: '别小路过载，也别熵增', file: 'M32.mp3'},
  {code: 'M33', text: '不要对票有感情，谁是县长不重要，重要的是我要当县长夫人', file: 'M33.mp3'},
  {code: 'M34', text: '不要猜，心无所住，物来则应，过去不留', file: 'M34.mp3'},
  {code: 'M35', text: '一切皆有可能，记住了吗？我们要做的是什么？是应对', file: 'M35.mp3'},
  {code: 'M36', text: '要信早信', file: 'M36.mp3'},
  {code: 'M37', text: '为你的知行合一账户充值。', file: 'M37.mp3'},
  {code: 'M38', text: '先慢后快，越来越快，坚持做对的事儿，方能行稳致远。世界上怕就怕认真二字', file: 'M38.mp3'},
  {code: 'M39', text: '拿不住就卖。卖完之后你的世界安静了，你的心就静下来了，你可以更多的去学习', file: 'M39.mp3'},
  {code: 'M40', text: '莫道今年春将近，明年春色倍还人', file: 'M40.mp3'},
  {code: 'M41', text: '市场总会奖励有信仰的人', file: 'M41.mp3'},
  {code: 'M42', text: '心无杂念，知行合一', file: 'M42.mp3'},
  {code: 'M43', text: '不要因为正确的决定带来坏结果就改变它', file: 'M43.mp3'},
  {code: 'M44', text: '完美图形干错也要干', file: 'M44.mp3'},
  {code: 'M45', text: '时刻要充满敬畏之心，如履薄冰', file: 'M45.mp3'},
  {code: 'M46A', text: '戒骄戒躁', file: 'M46A.mp3'},
  {code: 'M47', text: '物极必反', file: 'M47.mp3'},
  {code: 'M48', text: '一切以盘面为准', file: 'M48.mp3'},
  {code: 'M49', text: '积小胜为大胜', file: 'M49.mp3'},
  {code: 'M50', text: '闷声发大财', file: 'M50.mp3'},
  {code: 'M51', text: '只英雄救美，不锦上添花', file: 'M51.mp3'},
  {code: 'M52B', text: '就莫名其妙，人生就是莫名其妙', file: 'M52B.mp3'},
  {code: 'M53', text: '赚钱的票别做亏，以及设好止损', file: 'M53.mp3'},
  {code: 'M54', text: '就是你能赚多少钱不知道，没人知道，但是你能亏多少钱，那一定是你自己能决定的', file: 'M54.mp3'},
  {code: 'M55', text: '留得青山在，一定有下一个小米', file: 'M55.mp3'},
  {code: 'M56', text: '不要抱有偏见', file: 'M56.mp3'},
  {code: 'M57', text: '散户最重要的是心态，是不要和这个市场杠，要从自身找原因', file: 'M57.mp3'},
  { code: 'M58', text: '我能怎么办，我真的我，我，我真的没招了，我', file: 'M58.mp3' },
]

// 心法相关工具函数
export class HeartMethodManager {
  static getAllMethods(): HeartMethod[] {
    return HEART_METHODS
  }
  
  static getByIndex(index: number): HeartMethod | undefined {
    return HEART_METHODS[index]
  }
  
  static getCount(): number {
    return HEART_METHODS.length
  }
  
  static getTextByIndex(index: number): string {
    const method = this.getByIndex(index)
    return method ? method.text : ''
  }
  
  static getAllTextWithNumbers(): string {
    let result = '🃏 全部心法列表：\n\n'
    HEART_METHODS.forEach((method, index) => {
      result += `${index + 1}. ${method.text}\n`
    })
    return result
  }
}