async function generarFactura(idPedido) {
  try {
    // Verificar si ya existe la factura
    const readResponse = await fetch(`http://127.0.0.1:8080/factura/readOne/${idPedido}`, {
      method: 'GET'
    });

    if (readResponse.ok) {
      const facturaExistente = await readResponse.json();
      mostrarFactura(facturaExistente.pedido.idPedido); // Si ya existe, la muestra
    } else {
      // Si no existe, crear la factura
      const createResponse = await fetch(`http://127.0.0.1:8080/factura/create/${idPedido}`, {
        method: 'POST'
      });

    if (!createResponse.ok) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al generar la factura'
          });
      }

    const factura = await createResponse.json();

    // Mostrar alerta con los datos de la factura
    Swal.fire({
      icon: 'success',
      title: `Factura Nº ${factura.numeroDeFactura}`,
      html: `
        <b>Cliente:</b> ${factura.pedido.nombreYApellidoCliente}<br>
        <b>Fecha:</b> ${factura.fecha}<br>
        <b>Total:</b> $${factura.pedido.total.toFixed(2)}<br>
        <button id="descargarPdfBtn" class="btn btn-primary mt-2">Descargar PDF</button>
        `,
        didOpen: () => {
            document.getElementById('descargarPdfBtn').addEventListener('click', () => {
              generarPDF(factura);
            });
          }

    });
  }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo procesar la factura'
    });
  }
}

async function mostrarFactura(id) {
  try {
    const response = await fetch(`http://127.0.0.1:8080/factura/readOne/${id}`);
    if (!response.ok) throw new Error("No se pudo obtener la factura");

    const factura = await response.json();

    Swal.fire({
      icon: 'info',
      title: `Factura Nº ${factura.numeroDeFactura}`,
      html: `
        <b>Cliente:</b> ${factura.pedido.nombreYApellidoCliente}<br>
        <b>Fecha:</b> ${factura.fecha}<br>
        <b>Total:</b> $${factura.pedido.total.toFixed(2)}<br>
        <button id="descargarPdfBtn" class="btn btn-primary mt-2">Descargar PDF</button>
      `,
      didOpen: () => {
        document.getElementById('descargarPdfBtn').addEventListener('click', () => {
          generarPDF(factura);
        });
      }
    });

  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudo mostrar la factura", "error");
  }
}

function generarPDF(factura) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // --- INICIO CÓDIGO DEL LOGO ---
  // 1. Define la variable del logo (Versión LIMPIA)
  const base64Logo = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4Qm+aHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyI+IDxkYzpjcmVhdG9yPiA8cmRmOlNlcT4gPHJkZjpsaT5WZWN0b3JTdG9jay5jb20vMjgwMjUxNTU8L3JkZjpsaT4gPC9yZGY6U2VxPiA8L2RjOmNyZWF0b3I+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgFileHBhY2tldCBlbmQ9InciPz7/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAB2AHADAREAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAcIAQYEBQkDAv/EADEQAAEDBAIBAwMDAwQDAAAAAAECAwQABQYRBxIhCBMxFCJBFTJRCUJhIyRScRYlM//EABwBAQABBQEBAAAAAAAAAAAAAAAGAgMEBQcBCP/EADcRAAEDAwIDBgMIAgIDAAAAAAEAAhEDBCESMQVBUQYTIjJhcRSBkUJSYqGxwdHwI3IWosLh8f/aAAwDAQACEQMRAD8A9U6IlESiJREoiURKIlESiJREoiURKIlESiJREoiURKIlESiJREoiURKIlESiJREoiURKIlESiLHxRFEea+ou14ZyKjFl2W5TkMiMbjco/T2YQfV1aJSSFLHwVdR9oI+T4rSXXGLWzu6VnVMPqbKWWXZy4vbF1817QMwDMu05PoPSd1LgO63aiazREoiURKIlESiJREoiURKIlEWCdCiKo3KCn+ZuZG7hh0O3W5WCyv8AeZDcG1vIuLzR8RfZQU+4224r96leFg9fjZ5j2l7TWvCq500u8qUml52w0EDcg7kgCOvRda4VRPC+GaL1ziLkQ1gMaQftSZgkDYDbdS7xbzLcL3kisRy+DEtmSFhUqFKt61Kh3NlJAWWu/3ByHEbHZtRJ0QoEjetx2Y7V2faegalAaXt8zTuP5B5FRLi3BWWtL4u0cXU5gg+ZpO0xgg8iPYgFS7U2USSiJREoiURKIlESiJREoiURflX4oip76ZL9bLZgVydvFwi25qb9WXZU19LSPdLq17KlEDfYGvmW7puve0l9YPE9/RqMHoRDm/m1ds7R0arqlA0GlxbpgAE4iNh6FaxybzphNviW+72nKrZIySwTmrnBZYdKy8pJ6usdkjWnGlOI+dbIqO9h+Hcd4PxaldPtXtpO8L5EYPOCZwY5dVmW/C7mrrt69MhlQFpmBE7HPQwVc7Cc2svIWNw77j9wZuVrlJ7NvsqB0fylQ/CgfBB8givrlj21G6mnC4neWdewrOt7hpa4cj/djyK72q1hpREoiURKIlESiJREoiwTqiKDuZPUnb8MgXeLYnoTs6CFMybxcXvatlue14Q4sbLro8H2WgpX4UU1EeL9pbXhdQWjAatd21Ngl0dTsGj1cQFMuFdn33Omvdy2mcwPM4dROGt/E4gdJXmKGLjfcTvER60LuUiW6DCvrhLTbLffaw37vUEKOztOv3HdRWrWp/FsqitpAkuYBJJP3tM5HrO2F2GtVqX1OpSo1jBiNDHYHSZGo+swumx/hVl2I3dckZvzNnc7BE2Hb/qWiQSNkpWPGx/PkfFZlbiZzTsix1QfZc7Sf0Of6VrLTs/Y1AKjnGo/7r3aOcZAk/mvR/wsck4rx3gViw92PEtkIKCI9+hOlyDNecOwXSr7o7q9j7V/aTpKVfCa2vBe0dpdv+BqtNGv913PqWnZ3yz6BQntJwe6uLh91SkgDyRDmtHIAYc0dRnmRzVpQd1N1zVZoiURKIlESiJREoiURQP6nubYeAWZVkavBtUp+MuZcpsZQ9+DAT4UW/4edUQ02T8ErV/ZUT7R8Ur8PthTsm6q9Q6WA7An7R9GjJ+nNTXs7wg3bnXlVs02bTsXb5/C0eJ3XA5qkGM2a6co5CLxeIiLVYbK32j29TPuR7U0UhaGWW1bDkhSSFrdWFdSobBUfHKu7o8Po91ScX1Kpy6YdVdMFz3bhk4a0EYHTfq1G3a9jatbxOeZa08/xv8AX7rdmjA5lS9YuOsUmsty12dN9XJ7qcuF66yHwQdBP3eAB5ACQAAK1dxeXlu40dfd6caWYHvj98qq5u7ylXbR2H4TAG0Y3M/lzXIxqGxGm94kro+UGOIjC0pS02BruEn5A0Pt18/4rX06r32umozAdOogyT0n1TiFau6g1jKcgnzdN853jpz9lqPIHuWW4uSsPhRJd3XqPdYshAEG4oIJLDiB9peX16gjX7tE761mUnU7xncXhIYPE0jzsI+007w2ZPtjmsZr7h1BtM+Mtgzs4RuWnkeYGw9ArH+lDnO35hbI2OquC5CHIv1dlXNc3JLCT1diOE+Vux1eO3ypsoUfIUa7L2Z4nc3VF9nxCO/pGCRs8fZeP9huORkLnHaPhJptbxGi3wu80DEnZw6B3McnAjorH/NTRQJZoiURKIlESiLp52YWO2S3Isu82+LJb13ZeltoWnY2NpKtjwaIo65V9QeO4db1x4ORWVu4ra95yZLloVFtzHbr9Q91VtX3HSG0/c4rwNJClJsVamgQN/0W94Zw74x4c/yzAAI1OO+kTtjdxw0dTANGObn7FdeWBZkXuPdYNyyBlE65PTG1rmsxIqXlrWsHrpbi16A0kAJSkAJArl/HDV+Nr1GAk06YDTB81QwT8h9F1m2uGHhVCm4hus5aNmiSYjfZoBnJkk5KlvHchsTlriymbnbojctCpb8Uy2VHu6As9j2+RvX8eNfiubV6FZr3UywnTgGDs3Cqr1ga4PfCGyIxB6GdxEct5X5sObWe9Q3G5Mu329LboQhtue2jYHnQ0oHwfB14NXrmyqW9QGmS+RM6T/7/AJV6/ZbYYauoHOHRseoM/KdsFalAv9unXaQzHulsjTXCptyQ1PQhUdJJAWjZ0pRRs/HgjX926oY25Fv3Ia7SDORIPp1GfXIzyV2pfAk031W6CBDREgyZzzBwYjB6yudKiwLhZ7vY0X6yMxH1p+nfROZ91pxKgpLp0dlYUlBO/kg6rMpBtuaVZlN+oTqkGDyj2Ikei9ff0KJovoQTPikx4SIMdT9PXK0DAZlojcyKgy7hFgxVXyBckOx5iGzDXLCmJKmXAr7Sh37wR8dRsEbBmHBhUp3dq4gwQ+mTB2b4mE/Iwrda4YyxuqbHAwCQCQZBGqCOYJBkeuMwry8WeoLHcjSq13DKrLcJjXuiLeIsltEe6Ntq6LWlO/8ATdSdd2z48haNoUNdZpVNWD9eq4/xPh/w/wDmpjS0xLSZLCRIHq0/Zd8nQ4KXocxifGbkRnm5DDqQpDrSwpKh/II8EVkKPr7URKIlEWD5FEVAM/8AT9iOS/1M24uV2mDldoyzFnLu7AucVKkx3WAhhPU78/8Ax3s/8yP4oqpwuvhcTcM5jC4lyVnjbHcSvc3PJVgFpjRkqj3WIy7KYdUppQ0tPVpK+xG0qGgfPmmdlfdSEvjZo/j+hR9Z8PMz1/Zpxrh2C4aizPXGMuY/Px9iU3a7bHjtqcSw0oe22Vqc1267UtadnQoC7kVWe7YBLZMDnH/1Rp6ouVrPlHqmtdq4owjGFxcflm12uHGssdTNznrPtqdW2EhLoCyEoCtpHTtryaAuOxXpayiGtc2Tuf2H7n3jkpE9eWYWTiLifHuJxbcXn8nToCJWS3u3WSHFWwkjuGmg22OhUrwNaPRAJ/fTUZiV4GsDTVLQJwB+pz05evstj9e7WPYLxNi0S1SMOx6ResbDkiyOYy0Zl0JLIU8zLS2PZWjsVfuG/OgaFxndeUmjQXaQfc+nITn6FTdxdxNZb5xzwLMRhGD3GzzcZVLypNwscZ6dMQITXtqZAb7rc91Q7EfhXnZKaq1Gd1ZAbpOM4hVv9N+JccZrgXqxudoxG2yLLam35uNJu1uadftzZjyikILiSpGihP278dR+RVJJiVeDGis1uCMe3r8lx/6d/DvGuSYdImcm49Z72rL75+hY63c4rbiw5HiOPPrQpQ2N7CfH9yB+a9nkrIaSC4clbn+n3cJNi4yyjjO5Oldy47ySbYtK+fpiv3Y6v+ilZ1/gUVLxBwrTV6qEoiURYPxRFUPPbpCtn9SXDp02ZHhwoHHstcqTIdS22wkyVAFaiQEg7Gt0VbQXYaJK89uOeSH7T6zLZf7tJu2UW7HsgmOx49nQq5OFgLf9puOhBI6qK061pOjuqGgASFm1nPe/unGAOuAPeBv+atxZcr5ExG/8wcl2XgC9lGXPoelXLKp6LcuJASyhv2wy32e0Fe44pSdEAg/2bq1VqGlTc8iYzjJ+QWTbWzLy4ZQpv8RgDYAn3cRvsMZUK4jc8osWZsysSwbjzALzi6nJjUSFbpE+RJQ830Ett1xz/cFCPcCEhY/evSdkGohU7UWrG03saS18gHAAcPsumS0+4gKX0+y1Z9Y0qxDScySTPzDRGfNzB3gZW+5DZ865fsF5urmc4hMF4husS7la8MisTHOyeimS+pfvJWU/adkEDx+RWrq9rnUavc1bctMjd3Lrhu3sVd/4xVp3Lbep4ceYyQM8hqzzMxC7LJG+Q7nj9t/8t5IwncOMWIiMhw2EXIaNdR7SlK7o8BJGvPgfkUPa97qrqdG2LwObTP8A4q67smQ8soODwOgdn/sQo8XzNylikrj9FiyPE7wzx+4mNa1NxX4aZMVTaY7jb6lLKVNKSBtRKT2QCPOqkVHjTnAOq2724nkY9MZn2HNWq3Yy9FMaC0lxEiSOvofoJ9ipDw5zkixY9zLfonAtxkWvk+O4y67ilzaksx3w080t9qO4EuqbcW6V+PB8lOwRW9trgXdBtZgIDhOcH6KGXVoOH3Pc1XQ5sbQ4e0jn1xjmopX6sbp6fLdw5g2H21cKDj0Vv9ct+YY+mNJcuK5HaQ62p37mwQpXVaVeAfu+KyckrChjWRhxPqcK42HZDa8L9eF4ctlyiS8Z5UxtqbElQ30uR3rlBPRaErSSkrLKu2gd1UFYe0tA1CCrcDyK9VlZoiURYI2KIqz5n6BOOuT+asg5FzV25ZE/dFMdbMqQWITSGmUNhKgjS3P2dtFQHn4ryJ3VbXuZ5TCnTCONcV42tibfiuO2zHYaQE+zbYiGArX/ACKQCo/5O69VCir1xM+96ZMxQWlPNFMf3EpWpH2/UN7PZJBTr52D41Wp4k57KbXMMHUFKezVnQ4hxJlrcDwuDh0OxIj1Xn3Z7KuZhMG1uXmCq2tojy2Hbs8pEtklSlFMdz3Enbekk7IG1p+PNRM8Jo1Lk3cw5wyAAA6d5aZBPqu4vpU2U/hazX1IJEnJxsSQAZ6EeLG5XdxWWcjeP6jOu2QrSwg+1YwmQ6wQpfuFxTKAF9EJb2VrG9r0oeCLlGxsbQaWj5TP5fsMK66pVoNApgMG0vkTgR5jOTPInaRuF97biN7j3CdkVqwN9dmWxHebm3GKtLTAS2sLcDvkHuVghRUSrwNElOtg1xhmlSMe0D84Vqrc0HMbbVrka5IIBBJkiBG+I2jHtKkLkT078tP8Qs3RGOJuyZgK3rBbh/7KI0p1T4WpLjiUuK7K0UJ+4DQ0dEDOFtc1GyQB8zP6KFv7VcN4fd/4mOqaT5gWgGBpxImPnk5V2+BLZLtHC2EQbgw/GmR7PGbdZlNqbdbUGx9qkK8pI+CD5HxWw4ex9O2a2oIOcfMrmPGLmnecQrXFHyvcSPmtiy3Bcdz21rt2SWO3X+AsEGNcoqH0ef8ACwdf9itgtOq9xP6efGWMcp4vnGHi4YnJslyRcf0mK+XoD6gkpI9pzZbJCvlCh8fFeQqy9xbpJwrQJHUAV6qFmiJREoiURKIvhNhR7lEeiy2G5MZ5BQ4y8gLQtJ+QoHwQf4NUPY2o0teJBVbHupuD2GCNiN1oUP08cZQJZlMYBjiHye3b9NaPn/op1WELC2B5n6reP4/xZ7dDrl8f7Fa1zHwqi74te2MfZfjwLpFEa62S2O/T/VNp10dY1pKX0aGgfsdSPbX4KVJqfbNa0ikIB3Ax/T+uyz+FcYNKvTdckFzDLXOzBO4dzLT9WnxN5g8LgbhVWP4rjzN2+v8A0ezf6tns90WVOJdJKjLkI2UpdJJLbKftYB/KySn2hR0tE7DYfuf45K7xvi/f3FV1GNb8Pc3aPutO5H3nHLz+HBnXQ1qs1QxNaoizREoiURKIlESiJREoiURKIsfNEQDVEWaIlESiJREoiURKIlESiJREoiURKIlESiJREoiURKIlESiJREoiURKIlESiJREoiURKIlESiJRF/9k=';
  
    // 2. Agrega la imagen al documento
    doc.addImage(base64Logo, 'JPEG', 150, 10, 40, 25);
    // --- FIN CÓDIGO DEL LOGO ---

    const pedido = factura.pedido;

    // Datos de cabecera
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Factura Nº ${factura.numeroDeFactura}`, 20, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${factura.fecha}`, 20, 30);
    doc.text(`Hora: ${factura.hora}`, 20, 36);
    doc.text(`Cliente: ${pedido.nombreYApellidoCliente}`, 20, 42);
    doc.text(`Estado del Pedido: ${pedido.estado}`, 20, 48);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detalle del Pedido:", 20, 60);

    // Detalles
    let y = 70;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    pedido.detallesDelPedido.forEach(item => {
      doc.text(`${item.nombreProducto} (${item.tipo}, ${item.tamanio} porciones)`, 20, y);
      doc.text(`x${item.cantidad} = $${item.subtotal.toFixed(2)}`, 140, y);
      y += 8;
    });

    // Total
    doc.setFont("helvetica", "bold");
    doc.text(`Total: $${pedido.total.toFixed(2)}`, 20, y + 10);

    // Footer
    doc.setFontSize(10);
    doc.setFont("courier", "italic");
    doc.text("Pizzería Don Massimo", 150, 280, { align: 'right' });
    doc.text("Las mejores variedades de pizzas", 150, 285, { align: 'right' });

    // Descargar
    doc.save(`Factura_${factura.numeroDeFactura}_${pedido.nombreYApellidoCliente}.pdf`);
}