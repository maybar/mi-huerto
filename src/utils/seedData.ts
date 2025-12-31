import { supabase } from '../lib/supabase';

export async function seedInitialData() {
  const tiposCultivo = [
    {
      nombre: 'Cilantro',
      nombre_cientifico: 'Coriandrum sativum',
      familia: 'Apiaceae',
      dias_germinacion: 7,
      dias_cosecha: 45,
      temp_germinacion_min: 15,
      temp_germinacion_max: 25,
      temp_crecimiento_min: 10,
      temp_crecimiento_max: 30,
      info_plagas: 'Pulgones, trips. Prevenir con rotación de cultivos y buena ventilación.',
      info_suelo: 'Suelo bien drenado, rico en materia orgánica. pH 6.0-7.0.',
      info_riego: 'Riego regular, mantener suelo húmedo pero no encharcado.',
      info_luz: 'Sol parcial a pleno sol. 4-6 horas de luz directa.',
      info_general: 'Hierba aromática de rápido crecimiento. Se puede cosechar continuamente cortando las hojas exteriores.',
    },
    {
      nombre: 'Huacatay',
      nombre_cientifico: 'Tagetes minuta',
      familia: 'Asteraceae',
      dias_germinacion: 10,
      dias_cosecha: 60,
      temp_germinacion_min: 18,
      temp_germinacion_max: 28,
      temp_crecimiento_min: 15,
      temp_crecimiento_max: 30,
      info_plagas: 'Resistente a la mayoría de plagas. Repele algunos insectos.',
      info_suelo: 'Suelo bien drenado, tolera suelos pobres.',
      info_riego: 'Riego moderado, tolera algo de sequía.',
      info_luz: 'Pleno sol.',
      info_general: 'Hierba aromática peruana usada en la cocina. Tiene propiedades repelentes de insectos.',
    },
    {
      nombre: 'Lechuga',
      nombre_cientifico: 'Lactuca sativa',
      familia: 'Asteraceae',
      dias_germinacion: 7,
      dias_cosecha: 50,
      temp_germinacion_min: 10,
      temp_germinacion_max: 25,
      temp_crecimiento_min: 7,
      temp_crecimiento_max: 24,
      info_plagas: 'Babosas, caracoles, pulgones, trips. Usar trampas para babosas y control biológico.',
      info_suelo: 'Suelo ligero, rico en materia orgánica. pH 6.0-7.0.',
      info_riego: 'Riego frecuente y regular. No mojar las hojas para evitar enfermedades.',
      info_luz: 'Sol parcial. Tolera sombra ligera, especialmente en verano.',
      info_general: 'Cultivo de clima fresco. En climas cálidos, sembrar en primavera u otoño. Cosechar antes de que espigue.',
    },
    {
      nombre: 'Brócoli',
      nombre_cientifico: 'Brassica oleracea var. italica',
      familia: 'Brassicaceae',
      dias_germinacion: 10,
      dias_cosecha: 80,
      temp_germinacion_min: 15,
      temp_germinacion_max: 25,
      temp_crecimiento_min: 10,
      temp_crecimiento_max: 24,
      info_plagas: 'Orugas, pulgones, mosca blanca. Usar mallas anti-insectos y Bacillus thuringiensis.',
      info_suelo: 'Suelo fértil, rico en nitrógeno. pH 6.0-7.0.',
      info_riego: 'Riego abundante y regular. Necesita humedad constante.',
      info_luz: 'Pleno sol.',
      info_general: 'Cultivo de clima fresco. Cosechar cuando las cabezas estén firmes y compactas. Produce brotes laterales tras el corte principal.',
    },
    {
      nombre: 'Acelga',
      nombre_cientifico: 'Beta vulgaris var. cicla',
      familia: 'Amaranthaceae',
      dias_germinacion: 7,
      dias_cosecha: 60,
      temp_germinacion_min: 10,
      temp_germinacion_max: 30,
      temp_crecimiento_min: 5,
      temp_crecimiento_max: 30,
      info_plagas: 'Pulgones, minadores de hojas. Eliminar hojas afectadas y usar aceite de neem.',
      info_suelo: 'Suelo profundo, rico en materia orgánica. pH 6.0-7.5.',
      info_riego: 'Riego regular, mantener suelo húmedo.',
      info_luz: 'Sol a sombra parcial.',
      info_general: 'Muy resistente y productiva. Cosechar hojas exteriores dejando el centro crecer. Tolera heladas ligeras.',
    },
    {
      nombre: 'Habas',
      nombre_cientifico: 'Vicia faba',
      familia: 'Fabaceae',
      dias_germinacion: 14,
      dias_cosecha: 120,
      temp_germinacion_min: 5,
      temp_germinacion_max: 20,
      temp_crecimiento_min: 5,
      temp_crecimiento_max: 21,
      info_plagas: 'Pulgones negros, trips. Podar puntas cuando aparezcan pulgones.',
      info_suelo: 'Suelo profundo, bien drenado. pH 6.0-7.5. Fija nitrógeno atmosférico.',
      info_riego: 'Riego regular, especialmente durante la floración.',
      info_luz: 'Pleno sol.',
      info_general: 'Cultivo de clima fresco. Sembrar en otoño o invierno. Puede necesitar tutor. Mejora el suelo fijando nitrógeno.',
    },
    {
      nombre: 'Espinaca',
      nombre_cientifico: 'Spinacia oleracea',
      familia: 'Amaranthaceae',
      dias_germinacion: 10,
      dias_cosecha: 45,
      temp_germinacion_min: 10,
      temp_germinacion_max: 25,
      temp_crecimiento_min: 5,
      temp_crecimiento_max: 24,
      info_plagas: 'Pulgones, minadores. Usar mallas anti-insectos.',
      info_suelo: 'Suelo rico en nitrógeno y materia orgánica. pH 6.5-7.5.',
      info_riego: 'Riego regular, mantener suelo húmedo.',
      info_luz: 'Sol a sombra parcial.',
      info_general: 'Cultivo de clima fresco. Espiga con días largos y calor. Cosechar hojas exteriores o cortar toda la planta.',
    },
    {
      nombre: 'Ajos',
      nombre_cientifico: 'Allium sativum',
      familia: 'Amaryllidaceae',
      dias_germinacion: 14,
      dias_cosecha: 180,
      temp_germinacion_min: 10,
      temp_germinacion_max: 25,
      temp_crecimiento_min: 5,
      temp_crecimiento_max: 30,
      info_plagas: 'Trips, mosca de la cebolla. Rotación de cultivos y buena ventilación.',
      info_suelo: 'Suelo suelto, bien drenado. pH 6.0-7.0.',
      info_riego: 'Riego moderado. Reducir antes de la cosecha.',
      info_luz: 'Pleno sol.',
      info_general: 'Plantar dientes en otoño. Necesita periodo frío para formación de bulbos. Cosechar cuando hojas se amarilleen.',
    },
    {
      nombre: 'Alfalfa',
      nombre_cientifico: 'Medicago sativa',
      familia: 'Fabaceae',
      dias_germinacion: 7,
      dias_cosecha: 60,
      temp_germinacion_min: 15,
      temp_germinacion_max: 30,
      temp_crecimiento_min: 10,
      temp_crecimiento_max: 35,
      info_plagas: 'Pulgones, trips. Generalmente resistente.',
      info_suelo: 'Suelo profundo, bien drenado. pH 6.5-7.5. Fija nitrógeno.',
      info_riego: 'Riego profundo pero espaciado.',
      info_luz: 'Pleno sol.',
      info_general: 'Cultivo perenne, mejora el suelo. Se puede cortar varias veces. Excelente como abono verde.',
    },
    {
      nombre: 'Tomate',
      nombre_cientifico: 'Solanum lycopersicum',
      familia: 'Solanaceae',
      dias_germinacion: 10,
      dias_cosecha: 90,
      temp_germinacion_min: 18,
      temp_germinacion_max: 30,
      temp_crecimiento_min: 15,
      temp_crecimiento_max: 35,
      info_plagas: 'Mosca blanca, pulgones, tuta absoluta. Tutoreo necesario. Eliminar brotes laterales.',
      info_suelo: 'Suelo rico en materia orgánica. pH 6.0-7.0.',
      info_riego: 'Riego regular y constante. Evitar mojar follaje.',
      info_luz: 'Pleno sol, mínimo 6 horas.',
      info_general: 'Requiere tutor. Podar brotes laterales en variedades indeterminadas. Abonar regularmente.',
    },
    {
      nombre: 'Zanahoria',
      nombre_cientifico: 'Daucus carota',
      familia: 'Apiaceae',
      dias_germinacion: 14,
      dias_cosecha: 75,
      temp_germinacion_min: 10,
      temp_germinacion_max: 30,
      temp_crecimiento_min: 8,
      temp_crecimiento_max: 30,
      info_plagas: 'Mosca de la zanahoria. Usar mallas anti-insectos y rotación.',
      info_suelo: 'Suelo suelto, profundo, sin piedras. pH 6.0-7.0.',
      info_riego: 'Riego regular, especialmente durante la formación de raíces.',
      info_luz: 'Pleno sol.',
      info_general: 'Sembrar directamente, no trasplantar. Ralear dejando 5cm entre plantas. Suelo debe estar suelto para raíces rectas.',
    },
    {
      nombre: 'Pimiento',
      nombre_cientifico: 'Capsicum annuum',
      familia: 'Solanaceae',
      dias_germinacion: 14,
      dias_cosecha: 90,
      temp_germinacion_min: 20,
      temp_germinacion_max: 30,
      temp_crecimiento_min: 18,
      temp_crecimiento_max: 35,
      info_plagas: 'Pulgones, trips, mosca blanca. Control biológico y trampas cromáticas.',
      info_suelo: 'Suelo rico en materia orgánica. pH 6.0-7.0.',
      info_riego: 'Riego regular, evitar estrés hídrico.',
      info_luz: 'Pleno sol.',
      info_general: 'Sensible al frío. Trasplantar cuando no haya riesgo de heladas. Puede necesitar tutor.',
    },
  ];

  const { data: existingTipos } = await supabase.from('tipos_cultivo').select('nombre');
  const existingNames = new Set(existingTipos?.map((t) => t.nombre) || []);

  for (const tipo of tiposCultivo) {
    if (!existingNames.has(tipo.nombre)) {
      await supabase.from('tipos_cultivo').insert(tipo);
    }
  }

  const bancalesIniciales = [
    { nombre: 'Bancal A', lado: 'izquierda', posicion: 0, ancho: 1.2, alto: 3.0 },
    { nombre: 'Bancal B', lado: 'izquierda', posicion: 1, ancho: 1.2, alto: 3.0 },
    { nombre: 'Bancal C', lado: 'izquierda', posicion: 2, ancho: 1.2, alto: 3.0 },
    { nombre: 'Bancal D', lado: 'izquierda', posicion: 3, ancho: 1.2, alto: 3.0 },
    { nombre: 'Bancal E', lado: 'derecha', posicion: 0, ancho: 1.2, alto: 4.0 },
    { nombre: 'Bancal F', lado: 'derecha', posicion: 1, ancho: 1.2, alto: 2.0 },
    { nombre: 'Bancal G', lado: 'derecha', posicion: 2, ancho: 1.2, alto: 4.0 },
  ];

  const { data: existingBancales } = await supabase.from('bancales').select('nombre');
  const existingBancalNames = new Set(existingBancales?.map((b) => b.nombre) || []);

  for (const bancal of bancalesIniciales) {
    if (!existingBancalNames.has(bancal.nombre)) {
      await supabase.from('bancales').insert(bancal);
    }
  }

  const { data: bancalesData } = await supabase.from('bancales').select('*');
  const { data: tiposData } = await supabase.from('tipos_cultivo').select('*');

  if (bancalesData && tiposData) {
    const semillero = bancalesData.find((b) => b.nombre === 'Semillero');
    const bancalA = bancalesData.find((b) => b.nombre === 'Bancal A');
    const bancalB = bancalesData.find((b) => b.nombre === 'Bancal B');
    const bancalC = bancalesData.find((b) => b.nombre === 'Bancal C');
    const bancalE = bancalesData.find((b) => b.nombre === 'Bancal E');
    const bancalF = bancalesData.find((b) => b.nombre === 'Bancal F');

    const cilantro = tiposData.find((t) => t.nombre === 'Cilantro');
    const huacatay = tiposData.find((t) => t.nombre === 'Huacatay');
    const lechuga = tiposData.find((t) => t.nombre === 'Lechuga');
    const brocoli = tiposData.find((t) => t.nombre === 'Brócoli');
    const acelga = tiposData.find((t) => t.nombre === 'Acelga');
    const habas = tiposData.find((t) => t.nombre === 'Habas');
    const espinaca = tiposData.find((t) => t.nombre === 'Espinaca');
    const ajos = tiposData.find((t) => t.nombre === 'Ajos');
    const alfalfa = tiposData.find((t) => t.nombre === 'Alfalfa');
    const tomate = tiposData.find((t) => t.nombre === 'Tomate');
    const pimiento = tiposData.find((t) => t.nombre === 'Pimiento');

    const { data: existingCultivos } = await supabase.from('cultivos').select('*');

    if (existingCultivos && existingCultivos.length === 0) {
      const cultivosIniciales = [];

      if (semillero && tomate) {
        cultivosIniciales.push({
          bancal_id: semillero.id,
          tipo_cultivo_id: tomate.id,
          fecha_siembra: '2024-12-01',
          fecha_cosecha_estimada: '2025-02-29',
          estado: 'germinando',
          cantidad: '20 plantas',
          notas_siembra: 'Semillas en germinación',
        });
      }

      if (semillero && pimiento) {
        cultivosIniciales.push({
          bancal_id: semillero.id,
          tipo_cultivo_id: pimiento.id,
          fecha_siembra: '2024-11-25',
          fecha_cosecha_estimada: '2025-02-24',
          estado: 'germinando',
          cantidad: '15 plantas',
          notas_siembra: 'Semillas en germinación',
        });
      }

      if (bancalA && cilantro) {
        cultivosIniciales.push({
          bancal_id: bancalA.id,
          tipo_cultivo_id: cilantro.id,
          fecha_siembra: '2024-11-01',
          fecha_cosecha_estimada: '2024-12-16',
          estado: 'creciendo',
          cantidad: '1 fila',
        });
      }

      if (bancalA && huacatay) {
        cultivosIniciales.push({
          bancal_id: bancalA.id,
          tipo_cultivo_id: huacatay.id,
          fecha_siembra: '2024-11-15',
          fecha_cosecha_estimada: '2025-01-14',
          estado: 'germinando',
          cantidad: 'Semillas',
        });
      }

      if (bancalB && lechuga) {
        cultivosIniciales.push({
          bancal_id: bancalB.id,
          tipo_cultivo_id: lechuga.id,
          fecha_siembra: '2024-10-28',
          fecha_cosecha_estimada: '2024-12-17',
          estado: 'creciendo',
          cantidad: '10 plantas',
          notas_siembra: 'Bajo túnel con red',
        });
      }

      if (bancalC && brocoli) {
        cultivosIniciales.push({
          bancal_id: bancalC.id,
          tipo_cultivo_id: brocoli.id,
          fecha_siembra: '2024-09-28',
          fecha_cosecha_estimada: '2024-12-17',
          estado: 'creciendo',
          cantidad: '4 plantas',
        });
      }

      if (bancalC && acelga) {
        cultivosIniciales.push({
          bancal_id: bancalC.id,
          tipo_cultivo_id: acelga.id,
          fecha_siembra: '2024-10-15',
          fecha_cosecha_estimada: '2024-12-14',
          estado: 'creciendo',
          cantidad: '6 plantas',
        });
      }

      if (bancalE && habas) {
        cultivosIniciales.push({
          bancal_id: bancalE.id,
          tipo_cultivo_id: habas.id,
          fecha_siembra: '2024-08-19',
          fecha_cosecha_estimada: '2024-12-17',
          estado: 'floreciendo',
          cantidad: '8 plantas',
        });
      }

      if (bancalE && espinaca) {
        cultivosIniciales.push({
          bancal_id: bancalE.id,
          tipo_cultivo_id: espinaca.id,
          fecha_siembra: '2024-11-02',
          fecha_cosecha_estimada: '2024-12-17',
          estado: 'creciendo',
          cantidad: '2 filas',
        });
      }

      if (bancalE && lechuga) {
        cultivosIniciales.push({
          bancal_id: bancalE.id,
          tipo_cultivo_id: lechuga.id,
          fecha_siembra: '2024-10-28',
          fecha_cosecha_estimada: '2024-12-17',
          estado: 'creciendo',
          cantidad: '6 plantas grandes',
        });
      }

      if (bancalE && ajos) {
        cultivosIniciales.push({
          bancal_id: bancalE.id,
          tipo_cultivo_id: ajos.id,
          fecha_siembra: '2024-07-20',
          fecha_cosecha_estimada: '2025-01-16',
          estado: 'creciendo',
          cantidad: '20 dientes',
        });
      }

      if (bancalF && alfalfa) {
        cultivosIniciales.push({
          bancal_id: bancalF.id,
          tipo_cultivo_id: alfalfa.id,
          fecha_siembra: '2024-10-01',
          fecha_cosecha_estimada: '2024-11-30',
          estado: 'creciendo',
          cantidad: 'Cobertura completa',
        });
      }

      if (cultivosIniciales.length > 0) {
        await supabase.from('cultivos').insert(cultivosIniciales);
      }
    }
  }

  console.log('Datos iniciales cargados correctamente');
}
