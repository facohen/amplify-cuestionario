import { Cuestionario } from "../types/cuestionario";

export const cuestionarioData: Cuestionario = {
  id_cuestionario: "PSY-CRED-V23-ARG",
  version: "v23",
  title: "Cuestionario de Evaluación Psicométrica Completo",
  description: "Cuestionario de 54 preguntas psicométricas y demográficas para evaluación de riesgo crediticio.",
  total_questions: 54,
  creado_por: "Equipo de Riesgo",
  status: "draft",
  questions: [
    {
      question_number: 1,
      text: "¿Cuál es tu edad?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "18 a 24 años.", score: 0 },
        { option_key: "B", option_text: "25 a 44 años.", score: 0 },
        { option_key: "C", option_text: "45 a 59 años.", score: 0 },
        { option_key: "D", option_text: "60 años o más.", score: 0 }
      ]
    },
    {
      question_number: 2,
      text: "¿Cuál es tu estado civil?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Soltero.", score: 0 },
        { option_key: "B", option_text: "Casado / Conviviente.", score: 0 },
        { option_key: "C", option_text: "Separado.", score: 0 },
        { option_key: "D", option_text: "Viudo.", score: 0 }
      ]
    },
    {
      question_number: 3,
      text: "¿Cuántas personas dependen económicamente de vos?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Ninguna.", score: 0 },
        { option_key: "B", option_text: "1 a 2 personas.", score: 0 },
        { option_key: "C", option_text: "3 a 4 personas.", score: 0 },
        { option_key: "D", option_text: "5 o más personas.", score: 0 }
      ]
    },
    {
      question_number: 4,
      text: "¿Hace cuánto tiempo vivís en esta casa?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Menos de 1 año.", score: 0 },
        { option_key: "B", option_text: "1 a 3 años.", score: 0 },
        { option_key: "C", option_text: "4 a 10 años.", score: 0 },
        { option_key: "D", option_text: "Más de 10 años.", score: 0 }
      ]
    },
    {
      question_number: 5,
      text: "¿De dónde vienen tus ingresos principalmente?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Cobro un sueldo o jubilación todos los meses.", score: 0 },
        { option_key: "B", option_text: "Tengo negocio, profesion o comercio.", score: 0 },
        { option_key: "C", option_text: "Trabajo por mi cuenta, oficio o servicio", score: 0 },
        { option_key: "D", option_text: "No tengo ingresos propios.", score: 0 }
      ]
    },
    {
      question_number: 6,
      text: "¿Hace cuánto tiempo mantenés esta actividad o ingreso?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Menos de 1 año.", score: 0 },
        { option_key: "B", option_text: "Entre 1 y 3 años.", score: 0 },
        { option_key: "C", option_text: "Más de 3 años.", score: 0 },
        { option_key: "D", option_text: "No tengo ingresos actualmente.", score: 0 }
      ]
    },
    {
      question_number: 7,
      text: "¿Cómo recibís o manejás habitualmente la plata de tu trabajo?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Me depositan en cuenta bancaria (CBU).", score: 0 },
        { option_key: "B", option_text: "Me transfieren a billeteras (Mercado Pago, Ualá, etc).", score: 0 },
        { option_key: "C", option_text: "Cobro la mayor parte en efectivo.", score: 0 },
        { option_key: "D", option_text: "Cobro una parte en banco/billetera y otra en efectivo.", score: 0 }
      ]
    },
    {
      question_number: 8,
      text: "Cuando ves algo que te gusta en un local o en internet:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Pienso si realmente lo necesito.", score: 0 },
        { option_key: "B", option_text: "Comparo precios en otros lugares o sitios web.", score: 0 },
        { option_key: "C", option_text: "Lo compro, me gusta.", score: 0 },
        { option_key: "D", option_text: "Lo dejo para después.", score: 0 }
      ]
    },
    {
      question_number: 9,
      text: "Prefiero tener todo pensado con anticipación:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "A veces si, a veces no.", score: 0 },
        { option_key: "B", option_text: "Pienso todo de antemano.", score: 0 },
        { option_key: "C", option_text: "Resuelvo sobre la marcha.", score: 0 },
        { option_key: "D", option_text: "Prefiero que las cosas fluyan.", score: 0 }
      ]
    },
    {
      question_number: 10,
      text: "Querés comprarte una TV nueva para tu casa. La cuota es $60,000 por mes. ¿La comprás?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Sí, de alguna forma pago la cuota.", score: 0 },
        { option_key: "B", option_text: "No, la cuota es más alta que lo puedo pagar.", score: 0 },
        { option_key: "C", option_text: "Sí, voy a gastar menos en otras cosas.", score: 0 },
        { option_key: "D", option_text: "No, prefiero esperar a tener más plata.", score: 0 }
      ]
    },
    {
      question_number: 11,
      text: "Cuando tenés que cumplir con un plazo:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Generalmente cumplo en tiempo.", score: 0 },
        { option_key: "B", option_text: "A veces se me pasan pero aviso.", score: 0 },
        { option_key: "C", option_text: "Siempre cumplo antes de tiempo.", score: 0 },
        { option_key: "D", option_text: "A veces me paso de la fecha pero cumplo atrasado.", score: 0 }
      ]
    },
    {
      question_number: 12,
      text: "¿Qué pensás de las tarjetas de crédito?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Sirven para comprar en cuotas si podés pagarlas después.", score: 0 },
        { option_key: "B", option_text: "Son un riesgo; a veces comprás en cuotas y se te complica.", score: 0 },
        { option_key: "C", option_text: "Son una ayuda para llegar a fin de mes o darte un gusto.", score: 0 },
        { option_key: "D", option_text: "Prefiero no tenerlas y usar solo efectivo.", score: 0 }
      ]
    },
    {
      question_number: 13,
      text: "Me doy gustos comprando cosas que quiero:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Sí, seguido.", score: 0 },
        { option_key: "B", option_text: "Sí, a veces.", score: 0 },
        { option_key: "C", option_text: "No, rara vez.", score: 0 },
        { option_key: "D", option_text: "No, nunca lo hago.", score: 0 }
      ]
    },
    {
      question_number: 14,
      text: "Si tuvieras un mes muy complicado y debieras elegir entre pagar un impuesto / servicio o una cuota del préstamo:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Pago solamente el impuesto o servicio, para que no me corten.", score: 0 },
        { option_key: "B", option_text: "Pago solamente la cuota del préstamo, para no atrasarme.", score: 0 },
        { option_key: "C", option_text: "Pago el impuesto o servicio, y aviso que no puedo pagar la cuota del préstamo.", score: 0 },
        { option_key: "D", option_text: "Pago el servicio o impuesto y trato de juntar el dinero rápido para pagar la cuota.", score: 0 }
      ]
    },
    {
      question_number: 15,
      text: "¿Tenés algo de plata guardada para emergencias?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Muy poco ahorrado.", score: 0 },
        { option_key: "B", option_text: "Sí, tengo bastante ahorrado, para varios meses.", score: 0 },
        { option_key: "C", option_text: "Trato de ahorrar, pero no puedo.", score: 0 },
        { option_key: "D", option_text: "Sí, tengo ahorros para emergencias menores.", score: 0 }
      ]
    },
    {
      question_number: 16,
      text: "¿Para qué usarías un préstamo o crédito?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Para completar una compra.", score: 0 },
        { option_key: "B", option_text: "Para una emergencia.", score: 0 },
        { option_key: "C", option_text: "Para viajar o darme un gusto.", score: 0 },
        { option_key: "D", option_text: "Para cancelar otras deudas o préstamos.", score: 0 }
      ]
    },
    {
      question_number: 17,
      text: "Un amigo o familiar te pide plata prestada. ¿Que hacés?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Trato de ayudar siempre.", score: 0 },
        { option_key: "B", option_text: "Si ese mes me sobra plata, le presto", score: 0 },
        { option_key: "C", option_text: "Invento una excusa (como que no tengo) para no prestar.", score: 0 },
        { option_key: "D", option_text: "Le digo que NO porque no me gusta mezclar.", score: 0 }
      ]
    },
    {
      question_number: 18,
      text: "Me ha pasado tener menos plata de lo que yo pensaba:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Me ha pasado seguido.", score: 0 },
        { option_key: "B", option_text: "Me ha pasado algunas veces.", score: 0 },
        { option_key: "C", option_text: "Muy rara vez me ha pasado.", score: 0 },
        { option_key: "D", option_text: "No, nunca me ha pasado.", score: 0 }
      ]
    },
    {
      question_number: 19,
      text: "¿Qué es lo más importante cuando comprás algo?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Que me guste.", score: 0 },
        { option_key: "B", option_text: "La relación precio-producto.", score: 0 },
        { option_key: "C", option_text: "Que pueda pagarlo en cuotas.", score: 0 },
        { option_key: "D", option_text: "El precio más bajo.", score: 0 }
      ]
    },
    {
      question_number: 20,
      text: "Cuando asumo un compromiso o hago una promesa:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Intento cumplir con mi palabra.", score: 0 },
        { option_key: "B", option_text: "Hago mi mejor esfuerzo.", score: 0 },
        { option_key: "C", option_text: "Cumplo siempre.", score: 0 },
        { option_key: "D", option_text: "Prefiero no prometer.", score: 0 }
      ]
    },
    {
      question_number: 21,
      text: "¿Cómo manejaste tu plata durante el último año?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Con dificultades.", score: 0 },
        { option_key: "B", option_text: "Me alcanzó para lo básico.", score: 0 },
        { option_key: "C", option_text: "Pude permitirme algunos gastos extra.", score: 0 },
        { option_key: "D", option_text: "Pude ahorrar.", score: 0 }
      ]
    },
    {
      question_number: 22,
      text: "Al final del mes, ¿te sobra plata?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Llego con la plata justa.", score: 0 },
        { option_key: "B", option_text: "Me sobra plata.", score: 0 },
        { option_key: "C", option_text: "Muy seguido me falta.", score: 0 },
        { option_key: "D", option_text: "A veces sobra plata, a veces justo.", score: 0 }
      ]
    },
    {
      question_number: 23,
      text: "Si estás llegando justo o tarde a un lugar donde te esperan:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Aviso antes de salir.", score: 0 },
        { option_key: "B", option_text: "Aviso durante el viaje.", score: 0 },
        { option_key: "C", option_text: "Depende de la importancia.", score: 0 },
        { option_key: "D", option_text: "Trato de llegar lo antes posible.", score: 0 }
      ]
    },
    {
      question_number: 24,
      text: "Querés regalarle unas zapatillas de $150.000 a alguien especial, pero es solo efectivo. ¿Las comprás?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Sí, es una persona especial para mí.", score: 0 },
        { option_key: "B", option_text: "No, son muy caras.", score: 0 },
        { option_key: "C", option_text: "Le regalo algo más barato.", score: 0 },
        { option_key: "D", option_text: "Prometo comprárselas cuando tenga el efectivo.", score: 0 }
      ]
    },
    {
      question_number: 25,
      text: "¿Qué cuentas o billeteras digitales tenés o usas?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Solo efectivo, no uso bancos ni aplicaciones", score: 0 },
        { option_key: "B", option_text: "Solo billetera digital (como Mercado Pago, Cuenta DNI).", score: 0 },
        { option_key: "C", option_text: "Cuenta Sueldo o caja de ahorro.", score: 0 },
        { option_key: "D", option_text: "Cuenta bancaria, tarjeta de crédito y billetera digital (como Mercado Pago).", score: 0 }
      ]
    },
    {
      question_number: 26,
      text: "Cuando te surge un problema grave de golpe (ej: se rompe algo caro):",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Lo soluciono de alguna manera, rápido.", score: 0 },
        { option_key: "B", option_text: "Analizo bien antes de decidir.", score: 0 },
        { option_key: "C", option_text: "Me bloqueo.", score: 0 },
        { option_key: "D", option_text: "Pido ayuda.", score: 0 }
      ]
    },
    {
      question_number: 27,
      text: "Cuando tenés que tomar una decisión de dinero importante:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Me tomo mi tiempo para revisar los números.", score: 0 },
        { option_key: "B", option_text: "Si lo veo conveniente, decido en el momento.", score: 0 },
        { option_key: "C", option_text: "Consulto antes con alguien de confianza.", score: 0 },
        { option_key: "D", option_text: "Demoro en decidirme.", score: 0 }
      ]
    },
    {
      question_number: 28,
      text: "Pensando en las decisiones importantes que tomaste en tu vida:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Siempre tomé buenas decisiones.", score: 0 },
        { option_key: "B", option_text: "La gran mayoría fueron buenas decisiones.", score: 0 },
        { option_key: "C", option_text: "Tomé buenas decisiones y tuve errores, como cualquiera.", score: 0 },
        { option_key: "D", option_text: "He tomado varias malas decisiones.", score: 0 }
      ]
    },
    {
      question_number: 29,
      text: "Si perdiste dinero (por error, mala decisión o imprevisto), ¿cómo te sentiste?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Me enojé, mala suerte.", score: 0 },
        { option_key: "B", option_text: "Me dio bronca aunque a veces pasa.", score: 0 },
        { option_key: "C", option_text: "Aprendí a tener más cuidado.", score: 0 },
        { option_key: "D", option_text: "El dinero va y viene.", score: 0 }
      ]
    },
    {
      question_number: 30,
      text: "Me han cortado la luz, gas, cable, teléfono por no pagar a tiempo:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Me pasa seguido.", score: 0 },
        { option_key: "B", option_text: "A veces.", score: 0 },
        { option_key: "C", option_text: "Muy pocas veces.", score: 0 },
        { option_key: "D", option_text: "Nunca.", score: 0 }
      ]
    },
    {
      question_number: 31,
      text: "Si tuvieras que elegir entre opciones de pago de un préstamo:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Menos cuotas y más altas.", score: 0 },
        { option_key: "B", option_text: "Cuotas bajas y cómodas aunque sean más cuotas.", score: 0 },
        { option_key: "C", option_text: "Depende si la cuota es alta.", score: 0 },
        { option_key: "D", option_text: "La que me deje más margen para otros gastos.", score: 0 }
      ]
    },
    {
      question_number: 32,
      text: "Cuando cobrás, ¿cómo te organizás?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Separo para los gastos fijos.", score: 0 },
        { option_key: "B", option_text: "Pago primero las deudas más grandes.", score: 0 },
        { option_key: "C", option_text: "Guardo una cantidad fija y el resto lo administro.", score: 0 },
        { option_key: "D", option_text: "Voy gastando según mis necesidades.", score: 0 }
      ]
    },
    {
      question_number: 33,
      text: "Faltan 15 días y te das cuenta de que no llegás a cubrir la cuota del préstamo:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Pongo en venta algo mío para poder pagar la cuota.", score: 0 },
        { option_key: "B", option_text: "Pago dos cuotas juntas el mes que viene.", score: 0 },
        { option_key: "C", option_text: "Espero a ver si mi situación mejora.", score: 0 },
        { option_key: "D", option_text: "Llamo para avisar que me voy a atrasar en el pago.", score: 0 }
      ]
    },
    {
      question_number: 34,
      text: "Cuando tenés gastos pendientes, ¿qué decidís pagar primero?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Lo que vence más pronto.", score: 0 },
        { option_key: "B", option_text: "Lo más importante (luz, comida, alquiler).", score: 0 },
        { option_key: "C", option_text: "Lo que me cobran intereses si no pago.", score: 0 },
        { option_key: "D", option_text: "Depende de lo que pueda pagar.", score: 0 }
      ]
    },
    {
      question_number: 35,
      text: "¿Cómo pensás que serán tus ingresos y gastos dentro de un año?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Es imposible saber qué va a pasar.", score: 0 },
        { option_key: "B", option_text: "Confío en que las cosas van a mejorar.", score: 0 },
        { option_key: "C", option_text: "Siento que va a ser difícil.", score: 0 },
        { option_key: "D", option_text: "Tengo un plan más o menos claro.", score: 0 }
      ]
    },
    {
      question_number: 36,
      text: "Cuando no podés ahorrar a fin de mes, ¿qué pensás?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Me gustaría poder ahorrar.", score: 0 },
        { option_key: "B", option_text: "Yo me ajusto y ahorro.", score: 0 },
        { option_key: "C", option_text: "Es bueno vivir el presente.", score: 0 },
        { option_key: "D", option_text: "La plata nunca alcanza.", score: 0 }
      ]
    },
    {
      question_number: 37,
      text: "Pensando en tu pasado, ¿cómo dirías que manejaste tu plata?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Tomé malas decisiones, me hago cargo.", score: 0 },
        { option_key: "B", option_text: "Me equivoqué, pero aprendí.", score: 0 },
        { option_key: "C", option_text: "Gasté en cosas que no hacían falta.", score: 0 },
        { option_key: "D", option_text: "Quise hacer lo correcto, pero no siempre resultó.", score: 0 }
      ]
    },
    {
      question_number: 38,
      text: "¿Prometiste algo y después te diste cuenta que no podías cumplir?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Nunca me pasó.", score: 0 },
        { option_key: "B", option_text: "Me pasó muy pocas veces en mi vida.", score: 0 },
        { option_key: "C", option_text: "Me pasó algunas veces.", score: 0 },
        { option_key: "D", option_text: "Me pasó de vez en cuando, es normal.", score: 0 }
      ]
    },
    {
      question_number: 39,
      text: "Si tuvieras una emergencia económica:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Sería muy difícil conseguir ayuda.", score: 0 },
        { option_key: "B", option_text: "Familia/amigos me podrían ayudar.", score: 0 },
        { option_key: "C", option_text: "Vendo algo que tengo.", score: 0 },
        { option_key: "D", option_text: "Pido adelanto o préstamo.", score: 0 }
      ]
    },
    {
      question_number: 40,
      text: "En los últimos 12 meses, ¿alguien te prestó dinero o ayudó económicamente?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Sí, algo pequeño.", score: 0 },
        { option_key: "B", option_text: "Precisaba y nadie se ofreció.", score: 0 },
        { option_key: "C", option_text: "Sí, y fue importante para mí.", score: 0 },
        { option_key: "D", option_text: "No, pero me habrían ayudado si lo necesitaba.", score: 0 }
      ]
    },
    {
      question_number: 41,
      text: "Si alguien pide un préstamo y después le va mal económicamente:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Debería ajustar otros gastos.", score: 0 },
        { option_key: "B", option_text: "Priorizar la familia.", score: 0 },
        { option_key: "C", option_text: "Pedir más tiempo para pagar.", score: 0 },
        { option_key: "D", option_text: "Es mala suerte, a veces las cosas no salen.", score: 0 }
      ]
    },
    {
      question_number: 42,
      text: "¿Qué opinás de las billeteras digitales?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Prefiero manejar efectivo.", score: 0 },
        { option_key: "B", option_text: "Son útiles y necesarias.", score: 0 },
        { option_key: "C", option_text: "No me gustan para nada.", score: 0 },
        { option_key: "D", option_text: "Los uso pero no confío mucho.", score: 0 }
      ]
    },
    {
      question_number: 43,
      text: "He dejado cosas importantes sin hacer:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "No me suele pasar.", score: 0 },
        { option_key: "B", option_text: "Me ha pasado pocas veces.", score: 0 },
        { option_key: "C", option_text: "Me pasa de vez en cuando.", score: 0 },
        { option_key: "D", option_text: "Me pasa con frecuencia.", score: 0 }
      ]
    },
    {
      question_number: 44,
      text: "Si mañana te quedás sin trabajo, ¿qué hacés primero?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Pido ayuda a familia o amigos.", score: 0 },
        { option_key: "B", option_text: "Busco rápido alguna changa.", score: 0 },
        { option_key: "C", option_text: "Recorto gastos y uso ahorros.", score: 0 },
        { option_key: "D", option_text: "Hablo con conocidos para conseguir trabajo.", score: 0 }
      ]
    },
    {
      question_number: 45,
      text: "Si pedís un préstamo, ¿qué es más importante?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Tasa de interés baja.", score: 0 },
        { option_key: "B", option_text: "Cuota más baja.", score: 0 },
        { option_key: "C", option_text: "Aprobación rápida y simple.", score: 0 },
        { option_key: "D", option_text: "El que sea más flexible.", score: 0 }
      ]
    },
    {
      question_number: 46,
      text: "Respecto a mi futuro, pienso que:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Depende de estar en el lugar y momento correcto.", score: 0 },
        { option_key: "B", option_text: "Es una mezcla de esfuerzo y de suerte.", score: 0 },
        { option_key: "C", option_text: "Por más que planifique, es más importante la situación del país.", score: 0 },
        { option_key: "D", option_text: "Depende principalmente de mi.", score: 0 }
      ]
    },
    {
      question_number: 47,
      text: "Tu principal objetivo hoy es:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Llegar a fin de mes.", score: 0 },
        { option_key: "B", option_text: "Pagar todas mis deudas.", score: 0 },
        { option_key: "C", option_text: "Ahorrar para un gasto.", score: 0 },
        { option_key: "D", option_text: "Poder darme un gusto.", score: 0 }
      ]
    },
    {
      question_number: 48,
      text: "Cuando te comprometés con algo:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Cumplo siempre, al 100%.", score: 0 },
        { option_key: "B", option_text: "Si no estoy seguro, prefiero decir que no.", score: 0 },
        { option_key: "C", option_text: "Me cuesta decir que no.", score: 0 },
        { option_key: "D", option_text: "Si se me complica, aviso.", score: 0 }
      ]
    },
    {
      question_number: 49,
      text: "Con los aumentos de precios de este año:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Sigo comprando igual que siempre.", score: 0 },
        { option_key: "B", option_text: "Busco ofertas y marcas más baratas.", score: 0 },
        { option_key: "C", option_text: "Tuve que dejar de darme gustos.", score: 0 },
        { option_key: "D", option_text: "Solo me alcanza para lo básico.", score: 0 }
      ]
    },
    {
      question_number: 50,
      text: "Si intentás hablar con alguien sobre algo importante y no responde:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Pruebo por todos los medios posibles.", score: 0 },
        { option_key: "B", option_text: "Lo intento por 2-3 maneras diferentes.", score: 0 },
        { option_key: "C", option_text: "Le dejo un mensaje y espero respuesta.", score: 0 },
        { option_key: "D", option_text: "Espero a que él o ella llame.", score: 0 }
      ]
    },
    {
      question_number: 51,
      text: "Cuando no pude pagar algo y al final pude, pensé:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Al final lo solucioné.", score: 0 },
        { option_key: "B", option_text: "Me sentí mal por fallar.", score: 0 },
        { option_key: "C", option_text: "Aprendí a prevenir para que no vuelva a pasar.", score: 0 },
        { option_key: "D", option_text: "La situación era complicada.", score: 0 }
      ]
    },
    {
      question_number: 52,
      text: "¿Cuán seguido te pasa de tener gastos que no esperabas?",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "Nunca.", score: 0 },
        { option_key: "B", option_text: "Rara vez.", score: 0 },
        { option_key: "C", option_text: "Seguido.", score: 0 },
        { option_key: "D", option_text: "Es parte de la vida.", score: 0 }
      ]
    },
    {
      question_number: 53,
      text: "Me he equivocado con gastos de plata:",
      question_type: "multiple_choice",
      options: [
        { option_key: "A", option_text: "No me identifico con eso.", score: 0 },
        { option_key: "B", option_text: "Algunas veces por mal cálculo.", score: 0 },
        { option_key: "C", option_text: "Sí, a casi todos nos pasa.", score: 0 },
        { option_key: "D", option_text: "Si, y se aprende con el tiempo.", score: 0 }
      ]
    },
    {
      question_number: 54,
      text: "Vence la cuota y tenés un dolor de muelas insoportable, en el hospital no hay turno:",
      question_type: "forced_choice",
      options: [
        { option_key: "A", option_text: "Pago al dentista urgente. La cuota después veo.", score: 0 },
        { option_key: "B", option_text: "Pago la cuota puntualmente y aguanto con calmantes hasta conseguir turno.", score: 0 },
        { option_key: "C", option_text: "Trato de pagarle una parte al dentista y otra a la cuota.", score: 0 },
        { option_key: "D", option_text: "Pido prestado para cubrir las dos cosas.", score: 0 }
      ]
    }
  ]
};
