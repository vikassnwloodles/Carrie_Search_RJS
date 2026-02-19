import { useSearch } from '../context/SearchContext'

function CarrieLogo({ isHomePage = false, styles=`mb-12` }) {

    const { showImg } = useSearch()

    return (<>
        {(showImg || isHomePage) && <><img
            className={`Carrie-main-logo ${styles}`}
            style={{ width: "380px" }}
            // style={{ width: "380px", marginLeft: "-32px" }}
            src="/assets/images/pete.png"
            alt="Carrie"
        />
            {/* <br />
            <br /> */}
        </>
        }
    </>
    )
}

export default CarrieLogo