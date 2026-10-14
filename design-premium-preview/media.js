'use strict';

// Change this manifest when approved photographs arrive. No component rewrite is needed.
// Gallery IDs link the three homepage previews to entries; extra entries need no new preview.
window.FiloFinoMedia = {
  gallery: [
    { id: 'cuchillo-detalle', src: 'assets/images/revision.webp', width: 600, height: 800,
      alt: 'Un cuchillo sostenido a mano en el taller', caption: 'Cuchillos / La pieza, en detalle', whatsappContext: 'knives' },
    { id: 'manicura-detalle', src: 'assets/images/manicura.webp', width: 600, height: 1305,
      alt: 'Detalle de una herramienta de manicura entre manos enguantadas', caption: 'Manicura / Pequeña escala', whatsappContext: 'manicure' },
    { id: 'prueba-tijeras', src: 'assets/images/prueba-tijeras.webp', width: 800, height: 1740,
      alt: 'Tijeras durante una prueba de corte de cabello', caption: 'Peluquería / Comprobar el corte', whatsappContext: 'hair' }
  ],
  process: [
    { id: 'escuchar', src: 'assets/images/taller.webp', width: 900, height: 1200,
      alt: 'Interior del taller, donde se recibe la herramienta', caption: '01 / Recepción · Archivo del taller', fit: 'contain', position: 'center' },
    { id: 'revisar', src: 'assets/images/revision.webp', width: 600, height: 800,
      alt: 'Cuchillo en la mano para observar la pieza', caption: '02 / Revisión · Archivo del taller', fit: 'contain', position: 'center' },
    { id: 'afilar', src: 'assets/images/afilado.webp', width: 1140, height: 641,
      alt: 'Manos trabajando el filo de un cuchillo', caption: '03 / Afilado · Archivo del taller', fit: 'contain', position: 'center' },
    { id: 'comprobar', src: 'assets/images/prueba-tijeras.webp', width: 800, height: 1740,
      alt: 'Prueba de corte con unas tijeras', caption: '04 / Comprobación · Archivo del taller', fit: 'contain', position: 'center' }
  ]
};
