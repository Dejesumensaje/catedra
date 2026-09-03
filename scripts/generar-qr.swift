#!/usr/bin/env swift
// Genera los códigos QR del deck s05 con CIQRCodeGenerator (corrección Q, escala 12)
// y los verifica decodificándolos con Vision. Un QR que no resuelve es peor que no tener QR.
//
// Uso: swift scripts/generar-qr.swift
// Escribe en public/presentaciones/ps3/s05/assets/ y falla si alguno no decodifica.

import CoreImage
import Vision
import AppKit

let destino = "public/presentaciones/ps3/s05/assets"

let codigos: [(archivo: String, url: String)] = [
    ("qr-before-your-eyes.png", "https://www.beforeyoureyesgame.com/"),
    ("qr-pregoneros.png", "https://pregonerosdemedellin.com/"),
    ("qr-pulsaciones-raras.png", "https://www.uniandes.edu.co/es/noticias/medio-ambiente/pulsaciones-raras-una-experiencia-multisensorial-que-conecta-el-latido-humano-con-la-biodiversidad"),
    ("qr-papers-please.png", "https://papersplea.se/"),
    ("qr-historical-cost-of-light.png", "https://pudding.cool/2020/12/lighting-cost/"),
    ("qr-shutterbug.png", "https://vividfax.itch.io/shutterbug"),
    ("qr-hellfiler.png", "https://onefin.itch.io/hellfiler"),
    ("qr-picture-perfect.png", "https://incredulous.itch.io/picture-perfect"),
    ("qr-mrs-modifier.png", "https://walaber-ent.itch.io/mrs-modifier"),
    ("qr-my-shadows-are-bright.png", "https://buday.itch.io/my-shadows-are-bright"),
]

let contexto = CIContext()
var fallos = 0

for codigo in codigos {
    guard let filtro = CIFilter(name: "CIQRCodeGenerator") else {
        print("ERROR: no existe CIQRCodeGenerator"); fallos += 1; continue
    }
    filtro.setValue(Data(codigo.url.utf8), forKey: "inputMessage")
    filtro.setValue("Q", forKey: "inputCorrectionLevel")
    guard let salida = filtro.outputImage else {
        print("ERROR generando \(codigo.archivo)"); fallos += 1; continue
    }
    let escala = CGAffineTransform(scaleX: 12, y: 12)
    let imagen = salida.transformed(by: escala)
    guard let cg = contexto.createCGImage(imagen, from: imagen.extent) else {
        print("ERROR rasterizando \(codigo.archivo)"); fallos += 1; continue
    }

    // Verificar: decodificar con Vision y comparar contra la URL original.
    let solicitud = VNDetectBarcodesRequest()
    let manejador = VNImageRequestHandler(cgImage: cg)
    do {
        try manejador.perform([solicitud])
    } catch {
        print("ERROR decodificando \(codigo.archivo): \(error.localizedDescription)"); fallos += 1; continue
    }
    let decodificado = (solicitud.results ?? []).compactMap { $0.payloadStringValue }.first
    guard decodificado == codigo.url else {
        print("ERROR: \(codigo.archivo) decodifica «\(decodificado ?? "nada")» y debía ser «\(codigo.url)»")
        fallos += 1; continue
    }

    let ruta = "\(destino)/\(codigo.archivo)"
    let rep = NSBitmapImageRep(cgImage: cg)
    guard let png = rep.representation(using: .png, properties: [:]) else {
        print("ERROR escribiendo \(ruta)"); fallos += 1; continue
    }
    do {
        try png.write(to: URL(fileURLWithPath: ruta))
        print("OK \(codigo.archivo) → \(codigo.url)")
    } catch {
        print("ERROR escribiendo \(ruta): \(error.localizedDescription)"); fallos += 1
    }
}

exit(fallos == 0 ? 0 : 1)
